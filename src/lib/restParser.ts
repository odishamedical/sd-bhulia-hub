/**
 * Parses raw Firestore REST API JSON into standard JavaScript objects.
 */

export function parseFirestoreValue(value: any): any {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.nullValue !== undefined) return null;
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  if (value.mapValue !== undefined) {
    const obj: any = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  if (value.referenceValue !== undefined) return value.referenceValue;
  return value;
}

export function parseFirestoreDocument(doc: any) {
  if (!doc) return null;
  const data: any = { id: doc.name?.split('/').pop() };
  if (!doc.fields) return data;
  for (const [key, value] of Object.entries(doc.fields)) {
    data[key] = parseFirestoreValue(value);
  }
  return data;
}
