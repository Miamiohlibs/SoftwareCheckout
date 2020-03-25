module.exports = {
  nodePort: 9000,
  software: [
    {
      provider: 'Adobe',
      name: 'Adobe Photoshop', // libcal list name 
      shortName: 'photoshop',
      adobeGroupName: 'Library Patron Photoshop api'
    },
    {
      provider: 'Adobe',
      name: 'Adobe Illustrator',
      shortName: 'illustrator',
      // adobeGroupName: //deliberately omitted for testing purposes
    },
    {
      provider: 'Some other Company',
      name: 'WidgetWare',
      shortName: 'widgets',
      // adobeGroupName: //deliberately omitted for testing purposes
    }
  ]
}