#import "template.typ": *
#import "sections/abstract.typ": abstract
#import "sections/team-info.typ": team-info
#import "sections/product-description.typ": product-description

// Take a look at the file `template.typ` in the file panel
// to customize this template and discover how it works.
#show: project.with(
  title: "TermWise: OSU Course Planner",
  authors: (
    "Abderrahmane Rhandouri",
    "Eduardo Balzan",
    "Quinn Carey",
  ),
  abstract: abstract,
  date: "January 15, 2026",
)

= Team Info
#team-info

= Product Description
#product-description
