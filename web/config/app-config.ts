interface AppConfig {
  apiRoot: string;  // root URL for API calls
  dev: {
    showElementBorders: boolean;  // displays dotted black outer borders of components supporting this option if true
  };
  view: {
    breakpointVeryLarge: number;  // breakpoint for very large screens (min-width in px)
    breakpointLarge: number;      // breakpoint for large screens (min-width in px)
    breakpointMedium: number;     // breakpoint for medium screens (min-width in px)
  };
  settings: {
    groupDurationLimitInSeconds: number;  // maximum allowed duration for program groups in seconds
    maxWidth: number;  // maximum width for program screen display in px
  };
  components: {
    verticalContainer: {
      containerMargin: number;      // margin around entire container in px
      horizontalPadding: number;    // padding on left and right of child elements in px
      verticalPadding: number;      // padding on top and bottom of child elements in px
      alignment: 'left' | 'center' | 'right';  // horizontal alignment of child elements (options: 'left', 'center', 'right')
    };
    horizontalContainer: {
      containerMargin: number;            // margin around entire container in px
      horizontalPadding: number;          // padding on left and right of child elements in px
      verticalPadding: number;            // padding on top and bottom of child elements in px
      elementsPerRowVeryLarge: number;    // elements per row on very large screens
      elementsPerRowLarge: number;        // elements per row on large screens
      elementsPerRowMedium: number;       // elements per row on medium screens
      elementsPerRowSmall: number;        // elements per row on small screens
      alignment: 'left' | 'center' | 'right';  // horizontal alignment of child elements (options: 'left', 'center', 'right')
      width: number | string | undefined;      // width of container in px or percentage string, undefined for auto width
    };
    rectangle: {
      width: number;                // width of rectangle in px
      height: number;               // height of rectangle in px
      borderColor: string;          // border color
      borderThickness: number;      // border thickness in px
      fillColor: string;            // fill color
    };
    verticalSeparator: {
      height: string;               // height of vertical separator (CSS height value with unit)
    };
  };
}

export const appConfig: AppConfig = {
  apiRoot: process.env.APP_ENV === 'prod' ? 'https://pr-api.helpfulowl.com' : 'https://pr-api-dev.helpfulowl.com',
  dev: {
    showElementBorders: false,
  },
  view: {
    breakpointVeryLarge: 1200,
    breakpointLarge: 992,
    breakpointMedium: 576,
  },
  settings: {
    groupDurationLimitInSeconds: 7200,
    maxWidth: 800,
  },
  components: {
    verticalContainer: {
      containerMargin: 0,
      horizontalPadding: 0,
      verticalPadding: 0,
      alignment: 'center',
    },
    horizontalContainer: {
      containerMargin: 0,
      horizontalPadding: 20,
      verticalPadding: 20,
      elementsPerRowVeryLarge: 4,
      elementsPerRowLarge: 3,
      elementsPerRowMedium: 2,
      elementsPerRowSmall: 1,
      alignment: 'center',
      width: undefined,
    },
    rectangle: {
      width: 300,
      height: 200,
      borderColor: 'rgba(0,0,0,0.95)',
      borderThickness: 2,
      fillColor: 'rgba(0,0,255,0.95)',
    },
    verticalSeparator: {
      height: '2em',
    },
  },
};
