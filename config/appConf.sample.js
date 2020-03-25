module.exports = {
  nodePort: 9000, // could be any port; 9000 is the default for this app
  software: [
    {
      provider: 'Adobe', // 'Adobe' is currently the only supported value, but that could change in the future
      name: 'Adobe Photoshop', // REPLACE WITH the LIbCal name for the product 
      shortName: 'photoshop', // Short name for your own convenience
      adobeGroupName: 'MyLibrary Photoshop Patrons' // REPLACE WITH the Adobe User Mgmt User Group Name
    },
    {
      provider: 'Adobe', // 'Adobe' is currently the only supported value, but that could change in the future
      name: 'Adobe Illustrator', // REPLACE WITH the LIbCal name for the product 
      shortName: 'illustrator',
      adobeGroupName: 'MyLibrary Illustrator Patrons' // REPLACE WITH the Adobe User Mgmt User Group Name
    }
  ]
}

