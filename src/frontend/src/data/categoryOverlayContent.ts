export interface OverlaySection {
  type: 'photos' | 'text';
  content?: string;
  photos?: Array<{
    id: string;
    aspectRatio: string;
    placeholder: string;
  }>;
}

export interface CategoryOverlayData {
  categoryId: string;
  sections: OverlaySection[];
}

// Placeholder content for each category overlay
export const categoryOverlayContent: CategoryOverlayData[] = [
  {
    categoryId: 'photography',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'p1', aspectRatio: '16 / 9', placeholder: 'Landscape shot' },
          { id: 'p2', aspectRatio: '4 / 3', placeholder: 'Portrait composition' },
          { id: 'p3', aspectRatio: '1 / 1', placeholder: 'Square format' },
          { id: 'p4', aspectRatio: '3 / 2', placeholder: 'Classic ratio' },
        ],
      },
      {
        type: 'text',
        content: 'Photography is about capturing the essence of a moment. Each frame tells a story, frozen in time through careful composition and lighting.',
      },
    ],
  },
  {
    categoryId: 'design',
    sections: [
      {
        type: 'text',
        content: 'Design thinking merges creativity with functionality. Every element serves a purpose while maintaining aesthetic harmony.',
      },
      {
        type: 'photos',
        photos: [
          { id: 'd1', aspectRatio: '16 / 9', placeholder: 'UI mockup' },
          { id: 'd2', aspectRatio: '1 / 1', placeholder: 'Logo design' },
          { id: 'd3', aspectRatio: '9 / 16', placeholder: 'Mobile interface' },
        ],
      },
    ],
  },
  {
    categoryId: 'electronics',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'e1', aspectRatio: '4 / 3', placeholder: 'Circuit board' },
          { id: 'e2', aspectRatio: '16 / 9', placeholder: 'Prototype device' },
        ],
      },
      {
        type: 'text',
        content: 'Electronics projects bridge hardware and software, creating tangible solutions to real-world problems through innovative circuit design.',
      },
    ],
  },
  {
    categoryId: 'blender',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'b1', aspectRatio: '16 / 9', placeholder: '3D render' },
          { id: 'b2', aspectRatio: '1 / 1', placeholder: 'Character model' },
          { id: 'b3', aspectRatio: '21 / 9', placeholder: 'Cinematic scene' },
        ],
      },
      {
        type: 'text',
        content: 'Blender enables limitless creativity in 3D space. From modeling to animation, every project is an exploration of digital artistry.',
      },
    ],
  },
  {
    categoryId: 'designs',
    sections: [
      {
        type: 'text',
        content: 'A collection of experimental and production design work spanning various mediums and styles.',
      },
      {
        type: 'photos',
        photos: [
          { id: 'ds1', aspectRatio: '3 / 2', placeholder: 'Poster design' },
          { id: 'ds2', aspectRatio: '4 / 5', placeholder: 'Social media graphic' },
          { id: 'ds3', aspectRatio: '16 / 9', placeholder: 'Web banner' },
        ],
      },
    ],
  },
  {
    categoryId: 'videoedits',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'v1', aspectRatio: '16 / 9', placeholder: 'Video thumbnail' },
          { id: 'v2', aspectRatio: '9 / 16', placeholder: 'Vertical video' },
          { id: 'v3', aspectRatio: '16 / 9', placeholder: 'Timeline preview' },
        ],
      },
      {
        type: 'text',
        content: 'Video editing transforms raw footage into compelling narratives through precise cuts, transitions, and color grading.',
      },
    ],
  },
  {
    categoryId: 'photoedits',
    sections: [
      {
        type: 'text',
        content: 'Photo editing enhances the visual impact of images through color correction, retouching, and creative compositing.',
      },
      {
        type: 'photos',
        photos: [
          { id: 'pe1', aspectRatio: '4 / 3', placeholder: 'Before/After' },
          { id: 'pe2', aspectRatio: '1 / 1', placeholder: 'Retouched portrait' },
        ],
      },
    ],
  },
  {
    categoryId: 'youtube',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'yt1', aspectRatio: '16 / 9', placeholder: 'Video thumbnail 1' },
          { id: 'yt2', aspectRatio: '16 / 9', placeholder: 'Video thumbnail 2' },
          { id: 'yt3', aspectRatio: '16 / 9', placeholder: 'Video thumbnail 3' },
        ],
      },
      {
        type: 'text',
        content: 'YouTube content creation combines storytelling, editing, and audience engagement to build a community around shared interests.',
      },
    ],
  },
  {
    categoryId: 'instagram',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'ig1', aspectRatio: '1 / 1', placeholder: 'Instagram post' },
          { id: 'ig2', aspectRatio: '4 / 5', placeholder: 'Portrait post' },
          { id: 'ig3', aspectRatio: '9 / 16', placeholder: 'Story/Reel' },
          { id: 'ig4', aspectRatio: '1 / 1', placeholder: 'Grid post' },
        ],
      },
      {
        type: 'text',
        content: 'Instagram is a visual platform for sharing moments and creative work, optimized for mobile viewing and social engagement.',
      },
    ],
  },
  {
    categoryId: 'lab',
    sections: [
      {
        type: 'text',
        content: 'The lab is an experimental space where ideas are tested, prototypes are built, and innovation happens through trial and error.',
      },
      {
        type: 'photos',
        photos: [
          { id: 'l1', aspectRatio: '16 / 9', placeholder: 'Experiment setup' },
          { id: 'l2', aspectRatio: '4 / 3', placeholder: 'Prototype' },
        ],
      },
    ],
  },
  {
    categoryId: 'github',
    sections: [
      {
        type: 'photos',
        photos: [
          { id: 'gh1', aspectRatio: '16 / 9', placeholder: 'Code repository' },
          { id: 'gh2', aspectRatio: '16 / 9', placeholder: 'Project preview' },
        ],
      },
      {
        type: 'text',
        content: 'Open-source contributions and personal projects showcasing development skills, collaboration, and continuous learning.',
      },
    ],
  },
  {
    categoryId: 'aboutme',
    sections: [
      {
        type: 'text',
        content: 'A creative professional passionate about design, technology, and storytelling. Constantly exploring new tools and techniques to bring ideas to life.',
      },
      {
        type: 'photos',
        photos: [
          { id: 'am1', aspectRatio: '4 / 5', placeholder: 'Profile photo' },
          { id: 'am2', aspectRatio: '16 / 9', placeholder: 'Workspace' },
        ],
      },
      {
        type: 'text',
        content: 'Skills span multiple disciplines including photography, design, video editing, 3D animation, and electronics. Always learning, always creating.',
      },
    ],
  },
  {
    categoryId: 'connect',
    sections: [
      {
        type: 'text',
        content: 'Interested in collaboration or have a project in mind? Let\'s connect and explore opportunities together.',
      },
      {
        type: 'photos',
        photos: [
          { id: 'c1', aspectRatio: '16 / 9', placeholder: 'Contact banner' },
        ],
      },
      {
        type: 'text',
        content: 'Available for freelance work, collaborations, and creative projects. Reach out via email or social media to start a conversation.',
      },
    ],
  },
];

export function getOverlayContent(categoryId: string): CategoryOverlayData | undefined {
  return categoryOverlayContent.find((content) => content.categoryId === categoryId);
}
