export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** True until the owner replaces it with a real, attributed quote. Rendered with a "Sample" tag. */
  placeholder: boolean;
};

/**
 * Replace these with real quotes (name, role, permission) and set placeholder:false.
 * While placeholder is true the UI labels them as samples — never present sample quotes as real reviews.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The SERP stage made the conversation with our founder easy: apply two plays, watch the card climb, ship the change.",
    name: "Sample quote",
    role: "Head of Growth, B2B SaaS",
    placeholder: true,
  },
  {
    quote: "Twelve checks, ranked by weight, with the fix written out. It replaced a three-tab spreadsheet.",
    name: "Sample quote",
    role: "Freelance SEO consultant",
    placeholder: true,
  },
  {
    quote: "Dropping the Search Console export and seeing striking-distance queries as scenes is the workflow I wanted.",
    name: "Sample quote",
    role: "E-commerce manager, Athens",
    placeholder: true,
  },
];
