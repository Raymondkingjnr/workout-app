import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'tab',
  title: 'Tab',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The title of the tab, shown to users to identify this tab.',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Explain what this tab is for or what kind of content it holds.',
      type: 'string',
    }),
    defineField({
      name: 'inActive',
      title: 'Inactive',
      description:
        'Toggle this on if you want to hide this tab or mark it as not currently active.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
