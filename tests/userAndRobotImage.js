describe('Custom user and robot images', function() {
  var photo = 'https://space10-community.github.io/conversational-form/landingpage/photo2.jpg';
  
  var tags = [
    {
      "tag": "input",
      "type": "text",
      "name": "max-min-length",
      "minlength": 5,
      "maxlength": 15,
    }
  ];
  
  var instanceDefault = window.cf.ConversationalForm.startTheConversation({
    "options": {
      formEl: document.createElement("form"),
      "submitCallback": function(){},
    },
    "tags": tags
  });
  
  var instanceRobotImage = window.cf.ConversationalForm.startTheConversation({
    "options": {
      formEl: document.createElement("form"),
      "submitCallback": function(){},
      robotImage: photo,
      userImage: photo,
    },
    "tags": tags
  });

  var instanceDark = window.cf.ConversationalForm.startTheConversation({
    "options": {
      formEl: document.createElement("form"),
      "submitCallback": function(){},
      theme: 'dark'
    },
    "tags": tags
  });
  
  var instanceDarkRobotImage = window.cf.ConversationalForm.startTheConversation({
    "options": {
      formEl: document.createElement("form"),
      "submitCallback": function(){},
      robotImage: photo,
      userImage: photo,
      theme: 'dark'
    },
    "tags": tags
  });
  
  it('Theme should have a svg as value (default)', function() {
    expect(instanceDefault.dictionary.robotData['robot-image']).toContain('svg+xml');
    expect(instanceDefault.dictionary.data['user-image']).toContain('svg+xml');
  });
  
  it('Theme should have custom photo as robotImage', function() {
    expect(instanceRobotImage.dictionary.robotData['robot-image']).toEqual(photo);
    expect(instanceRobotImage.dictionary.data['user-image']).toEqual(photo);
  });

  it('Dark Theme should have a svg as value (default)', function() {
    expect(instanceDark.dictionary.robotData['robot-image']).toContain('svg+xml');
    expect(instanceDark.dictionary.data['user-image']).toContain('svg+xml');
  });
  
  it('Dark Theme should have custom photo as robotImage', function() {
    expect(instanceDarkRobotImage.dictionary.robotData['robot-image']).toEqual(photo);
    expect(instanceDarkRobotImage.dictionary.data['user-image']).toEqual(photo);
  });
  
  
});
