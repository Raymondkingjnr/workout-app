import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  icon: () => '🏋️‍♂️',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The name of the exercise.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'A short description of the exercise and how to perform it.',
      type: 'text',
      validation: (Rule) => Rule.required(),
      rows: 4,
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      description: 'How challenging the exercise is to perform.',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'A photo or illustration showing the exercise.',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description:
            "Remember to use alt text for people to be able to read what is happening in the image if they are using a screen reader, it's also important for SEO",
        }),
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'A link to a video demonstrating the exercise.',
      type: 'url',
    }),
    defineField({
      name: 'inActive',
      title: 'Inactive',
      description: 'Mark this exercise as inactive if it should not be shown.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subTitle: 'difficulty',
      media: 'image',
    },
  },
})
