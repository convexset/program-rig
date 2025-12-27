import { ProgramDefinition, ValidationResult } from '@/types/program';
import { appConfig } from '@/config/app-config';

/**
 * Validate a program definition
 */
export function validateProgram(definition: ProgramDefinition | null): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!definition) {
    return { isValid: false, errors: ['Program definition is null'], warnings };
  }

  // Check that there is at least one screen
  if (!definition.screens || definition.screens.length === 0) {
    errors.push('Program must have at least one screen');
    return { isValid: false, errors, warnings };
  }

  // Check all screens have same duration
  const durations = definition.screens.map((s) => s.duration);
  if (new Set(durations).size > 1) {
    errors.push('All screens must have the same total duration');
  }

  // Check duration limit
  const maxDuration = appConfig.settings.groupDurationLimitInSeconds;
  if (durations.some((d) => d > maxDuration)) {
    errors.push(`Screen duration cannot exceed ${maxDuration} seconds`);
  }

  // Validate each screen
  for (const screen of definition.screens) {
    // Check screen has groups
    if (!screen.groups || screen.groups.length === 0) {
      errors.push(`Screen "${screen.name}" must have at least one group`);
      continue;
    }

    // Calculate total duration
    const totalDuration = screen.groups.reduce((sum, group) => sum + group.duration, 0);
    if (totalDuration !== screen.duration) {
      errors.push(
        `Screen "${screen.name}": sum of group durations (${totalDuration}s) does not match screen duration (${screen.duration}s)`
      );
    }

    // Validate each group
    for (const group of screen.groups) {
      // Check group duration is positive
      if (group.duration <= 0) {
        errors.push(`Group "${group.name}": duration must be positive`);
      }

      // Check cyclic text alignment
      const cyclicPart = group.parts.find((p) => p.type === 'cyclic-text');
      if (cyclicPart && cyclicPart.type === 'cyclic-text') {
        const totalCyclicDuration = cyclicPart.items.reduce((sum, item) => sum + item.duration, 0);
        if (totalCyclicDuration === 0) {
          errors.push(`Group "${group.name}": cyclic text must have non-zero total duration`);
        } else if (group.duration % totalCyclicDuration !== 0) {
          errors.push(
            `Group "${group.name}": duration (${group.duration}s) must be integer multiple of cyclic text total (${totalCyclicDuration}s)`
          );
        }
      }

      // Check style is valid
      if (group.style !== 'normal' && group.style !== 'rest') {
        errors.push(`Group "${group.name}": style must be 'normal' or 'rest'`);
      }
    }
  }

  // Check screenDuration matches
  if (definition.screenDuration !== durations[0]) {
    warnings.push(
      `Program screenDuration (${definition.screenDuration}s) does not match actual screen duration (${durations[0]}s)`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
