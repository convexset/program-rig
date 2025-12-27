import { ProgramDefinition, Screen, Group, CyclicTextItem } from '@/types/program';
import { extractYouTubeId } from '@/lib/utils/youtube';

/**
 * Simple markdown to HTML converter
 */
function parseMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers with styling
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 1rem 0; color: #1976d2;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.8rem; font-weight: 700; margin: 2rem 0 1rem 0; color: #1565c0;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size: 2.2rem; font-weight: 700; margin: 2rem 0 1rem 0; color: #0d47a1;">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700; color: #1976d2;">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: #555;">$1</em>');
  
  // Lists - capture consecutive list items and wrap in ul
  const listItems: string[] = [];
  const listRegex = /^- (.+)$/gm;
  let listMatch;
  while ((listMatch = listRegex.exec(html)) !== null) {
    listItems.push(listMatch[0]);
  }
  if (listItems.length > 0) {
    const listBlock = listItems.join('\n');
    const listHTML = listBlock.replace(/^- (.+)$/gm, '<li style="margin: 0.5rem 0; padding-left: 0.5rem;">$1</li>');
    html = html.replace(listBlock, '<ul style="list-style-type: disc; padding-left: 2rem; margin: 1rem 0; text-align: left;">' + listHTML + '</ul>');
  }
  
  // Tables
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((\|.+\|\n?)+)/gm;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    const headers = lines[0].split('|').filter(c => c.trim()).map(h => h.trim());
    const rows = lines.slice(2).map(line => 
      line.split('|').filter(c => c.trim()).map(c => c.trim())
    );
    
    let table = '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><thead><tr style="background-color: #1976d2; color: white;">';
    headers.forEach(h => table += `<th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; border: 1px solid #ddd;">${h}</th>`);
    table += '</tr></thead><tbody>';
    rows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#f9f9f9' : '#ffffff';
      table += `<tr style="background-color: ${bgColor};">`;
      row.forEach(cell => table += `<td style="padding: 0.75rem 1rem; border: 1px solid #ddd;">${cell}</td>`);
      table += '</tr>';
    });
    table += '</tbody></table>';
    return table;
  });
  
  // Paragraphs
  html = html.replace(/^(?!<[hl]|<ul|<table)(.+)$/gm, '<p style="margin: 0.75rem 0; text-align: center;">$1</p>');
  
  return html;
}

/**
 * Parse a program definition from markdown-like text
 */
export function parseProgram(text: string): ProgramDefinition | null {
  try {
    const lines = text.split('\n');
    const screens: Screen[] = [];
    let currentScreen: Screen | null = null;
    let currentGroup: Group | null = null;
    let inCyclicText = false;
    let cyclicTextItems: CyclicTextItem[] = [];
    let inClosingMessage = false;
    let closingMessageLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Screen header: # Screen: NAME
      if (line.startsWith('# Screen:')) {
        if (currentGroup && currentScreen) {
          currentScreen.groups.push(currentGroup);
        }
        if (currentScreen) {
          // Process closing message if any
          if (closingMessageLines.length > 0) {
            currentScreen.closingMessage = parseMarkdownToHTML(closingMessageLines.join('\n'));
            closingMessageLines = [];
          }
          currentScreen.duration = currentScreen.groups.reduce((sum, g) => sum + g.duration, 0);
          screens.push(currentScreen);
        }

        const screenName = line.substring('# Screen:'.length).trim();
        currentScreen = {
          name: screenName,
          groups: [],
          duration: 0,
        };
        currentGroup = null;
        inClosingMessage = false;
      }
      // Closing Message header: ## Closing Message
      else if (line === '## Closing Message') {
        if (currentGroup && currentScreen) {
          currentScreen.groups.push(currentGroup);
          currentGroup = null;
        }
        inClosingMessage = true;
        inCyclicText = false;
        closingMessageLines = [];
      }
      // Capture closing message content
      else if (inClosingMessage) {
        closingMessageLines.push(lines[i]); // Keep original line with formatting
      }
      // Group header: ## Group: NAME
      else if (line.startsWith('## Group:') && !inClosingMessage) {
        if (currentGroup && currentScreen) {
          currentScreen.groups.push(currentGroup);
        }

        const groupName = line.substring('## Group:'.length).trim();
        currentGroup = {
          name: groupName,
          duration: 0,
          style: 'normal',
          parts: [],
        };
        inCyclicText = false;
      }
      // Duration: N seconds
      else if (line.startsWith('Duration:') && currentGroup) {
        const match = line.match(/Duration:\s*(\d+)\s*seconds?/i);
        if (match) {
          currentGroup.duration = parseInt(match[1], 10);
        }
      }
      // Style: rest|normal
      else if (line.startsWith('Style:') && currentGroup) {
        const styleMatch = line.match(/Style:\s*(\w+)/i);
        if (styleMatch) {
          const style = styleMatch[1].toLowerCase();
          if (style === 'rest' || style === 'normal') {
            currentGroup.style = style;
          }
        }
      }
      // Cyclic Text Sequence:
      else if (line.startsWith('Cyclic Text Sequence:') && currentGroup) {
        inCyclicText = true;
        cyclicTextItems = [];
      }
      // Cyclic text item: - N seconds | text1 | text2
      else if (inCyclicText && line.startsWith('-')) {
        const match = line.match(/^-\s*(\d+)\s*seconds?\s*\|\s*([^|]+)\s*\|\s*(.+)$/i);
        if (match) {
          cyclicTextItems.push({
            duration: parseInt(match[1], 10),
            'center-text': match[2].trim(),
            'right-text': match[3].trim(),
          });
        }
      }
      // Centered Short Text: or Centered Text:
      else if ((line.startsWith('Centered Short Text:') || line.startsWith('Centered Text:')) && currentGroup) {
        // Flush cyclic text if any
        if (inCyclicText && cyclicTextItems.length > 0) {
          currentGroup.parts.push({
            type: 'cyclic-text',
            items: cyclicTextItems,
          });
          cyclicTextItems = [];
          inCyclicText = false;
        }

        const prefix = line.startsWith('Centered Short Text:') ? 'Centered Short Text:' : 'Centered Text:';
        const label = line.substring(prefix.length).trim();
        const type = line.startsWith('Centered Short Text:') ? 'centered-short-text' : 'centered-text';
        currentGroup.parts.push({
          type: type as 'centered-text' | 'centered-short-text',
          label,
        });
      }
      // Video: URL
      else if (line.startsWith('Video:') && currentGroup) {
        // Flush cyclic text if any
        if (inCyclicText && cyclicTextItems.length > 0) {
          currentGroup.parts.push({
            type: 'cyclic-text',
            items: cyclicTextItems,
          });
          cyclicTextItems = [];
          inCyclicText = false;
        }

        const url = line.substring('Video:'.length).trim();
        const videoId = extractYouTubeId(url);
        if (videoId) {
          currentGroup.parts.push({
            type: 'youtube',
            id: videoId,
          });
        }
      }
      // Group Countdown Timer: true
      else if (line.startsWith('Group Countdown Timer:') && currentGroup) {
        // Flush cyclic text if any
        if (inCyclicText && cyclicTextItems.length > 0) {
          currentGroup.parts.push({
            type: 'cyclic-text',
            items: cyclicTextItems,
          });
          cyclicTextItems = [];
          inCyclicText = false;
        }

        const value = line.substring('Group Countdown Timer:'.length).trim().toLowerCase();
        if (value === 'true') {
          currentGroup.parts.push({
            type: 'group-countdown-timer',
          });
        }
      }
      // Empty line might end cyclic text
      else if (line === '' && inCyclicText && cyclicTextItems.length > 0) {
        if (currentGroup) {
          currentGroup.parts.push({
            type: 'cyclic-text',
            items: cyclicTextItems,
          });
          cyclicTextItems = [];
        }
        inCyclicText = false;
      }
    }

    // Flush any remaining group and screen
    if (currentGroup && currentScreen) {
      currentScreen.groups.push(currentGroup);
    }
    if (currentScreen) {
      // Process closing message if any
      if (closingMessageLines.length > 0) {
        currentScreen.closingMessage = parseMarkdownToHTML(closingMessageLines.join('\n'));
      }
      currentScreen.duration = currentScreen.groups.reduce((sum, g) => sum + g.duration, 0);
      screens.push(currentScreen);
    }

    if (screens.length === 0) {
      return null;
    }

    const screenDuration = screens[0]?.duration || 0;

    return {
      screens,
      screenDuration,
    };
  } catch (error) {
    console.error('Error parsing program:', error);
    return null;
  }
}
