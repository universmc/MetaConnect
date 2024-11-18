import Groq from 'groq-sdk';

const db = new Groq({});

const schema = {
  "investigation": {
    "fields": [
      {
        "name": "id",
        "type": "number"
},
      {
        "name": "date",
        "type": "date"
},
      {
        "name": "subject",
        "type": "text"
},
      {
        "name": "evidence",
        "type": "array",
        "items": {
          "type": "text"
}
      }
    ]
  }
};

await db.schema(schema);
