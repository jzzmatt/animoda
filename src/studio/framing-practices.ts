export type FramingExample = {
  src: string;
  alt: string;
};

export type FramingPractice = {
  id: string;
  title: string;
  description: string;
  checklist: readonly string[];
  correct: FramingExample;
  incorrect: FramingExample;
};

const imageDir = "/images/animoda/framing-practices";

export const framingPractices: readonly FramingPractice[] = [
  {
    id: "upright-stance",
    title: "Upright stance",
    description: "Stand straight with relaxed shoulders.",
    checklist: ["Stand naturally", "Keep your arms relaxed", "Look at the camera", "Both feet on the ground"],
    correct: {
      src: `${imageDir}/upright-stance-correct.webp`,
      alt: "Adult model standing upright, facing the camera, with relaxed arms and both feet on the ground.",
    },
    incorrect: {
      src: `${imageDir}/upright-stance-incorrect.webp`,
      alt: "Adult model leaning to one side, with uneven posture and both feet visible.",
    },
  },
  {
    id: "frontal-light",
    title: "Frontal light",
    description: "Avoid harsh backlighting or heavy cast shadows.",
    checklist: ["Use good natural or soft light", "Make sure your face is well lit", "Avoid strong light behind you", "Avoid dark shadows on your face"],
    correct: {
      src: `${imageDir}/frontal-light-correct.webp`,
      alt: "Close portrait with the face evenly lit from the front.",
    },
    incorrect: {
      src: `${imageDir}/frontal-light-incorrect.webp`,
      alt: "Close portrait with the face in shadow and a bright light behind the head.",
    },
  },
  {
    id: "full-torso",
    title: "Full torso view",
    description: "Keep the waistline and collarbones in the frame.",
    checklist: ["Show your head, torso and most of your legs", "Keep your waistline visible", "Include your collarbones", "Avoid cropped or too close photos"],
    correct: {
      src: `${imageDir}/full-torso-correct.webp`,
      alt: "Front view showing the head, collarbones, waist, and most of the legs.",
    },
    incorrect: {
      src: `${imageDir}/full-torso-incorrect.webp`,
      alt: "Photograph cropped tightly around the upper shirt, without the head or the legs.",
    },
  },
  {
    id: "neutral-gaze",
    title: "Neutral gaze",
    description: "A direct gaze makes the collar area easier to see.",
    checklist: ["Look directly at the camera", "Keep a neutral or slight smile", "Avoid looking away", "Avoid wearing sunglasses or hats"],
    correct: {
      src: `${imageDir}/neutral-gaze-correct.webp`,
      alt: "Close portrait looking directly at the camera, with the collar visible.",
    },
    incorrect: {
      src: `${imageDir}/neutral-gaze-incorrect.webp`,
      alt: "Close portrait with the head turned and the gaze directed away from the camera.",
    },
  },
] as const;

export const framingPracticeImageNames = [
  "upright-stance-correct.webp",
  "upright-stance-incorrect.webp",
  "frontal-light-correct.webp",
  "frontal-light-incorrect.webp",
  "full-torso-correct.webp",
  "full-torso-incorrect.webp",
  "neutral-gaze-correct.webp",
  "neutral-gaze-incorrect.webp",
] as const;
