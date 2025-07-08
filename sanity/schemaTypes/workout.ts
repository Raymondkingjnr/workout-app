import {defineType, defineField, defineArrayMember} from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: () => '🏋️‍♂️',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: "The user's Clerk ID who performed this workout.",
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description: 'The date when the workout was performed.',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      description: 'Total duration of the workout in minutes.',
      type: 'number',
      validation: (Rule) => Rule.min(1).required(),
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description: 'List of exercises performed in this workout with details.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'Reference to the exercise performed.',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'Sets performed for this exercise.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'set',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      description: 'Number of repetitions performed.',
                      type: 'number',
                      validation: (Rule) => Rule.min(1).required(),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'Amount of weight used for this set.',
                      type: 'number',
                      validation: (Rule) => Rule.min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description: 'Unit of the weight used (lbs or kg).',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Kilograms (kg)', value: 'kg'},
                          {title: 'Pounds (lbs)', value: 'lbs'},
                        ],
                        layout: 'radio',
                      },
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      date: 'date',
      exercises: 'exercises',
    },
    prepare(selection) {
      const {date, exercises} = selection
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      const exerciseCount = exercises?.length || 0
      return {
        title: `Workout on ${formattedDate}`,
        subtitle: `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`,
      }
    },
  },
})
