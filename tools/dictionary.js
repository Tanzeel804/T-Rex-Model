export class Dictionary {
  constructor() {
    this.name = 'dictionary';
    this.description = 'English dictionary with definitions';
  }

  async execute(input, sessionId) {
    try {
      // Mock dictionary data
      return {
        success: true,
        word: input,
        meanings: [{
          partOfSpeech: 'noun',
          definitions: [{
            definition: 'Sample definition for ' + input,
            example: 'Example usage of ' + input
          }]
        }]
      };
    } catch (error) {
      return {
        success: false,
        error: 'Dictionary lookup failed'
      };
    }
  }
}

