/**
 * Build an Expression, ExpressionAttributeValues and ExpressionAttributeNames
 * for a DynamoDB "update" request from a received fields object.
 *
 * @param {Object} fieldsObject An object that contains the fields to update.
 * @returns {Object} Contains expression, attributeValues and attributeNames.
 */
export default function buildUpdateExpression(fieldsObject) {
  const keys = Object.keys(fieldsObject);
  if (keys.length <= 0) {
    return { attributeNames: '', attributeValues: '', expression: '' };
  }

  let expression = 'SET ';
  const attributeValues = {};
  const attributeNames = {};
  keys.forEach((key, index) => {
    if (index > 0) expression += ', ';
    expression += `#${index} = :${key}`;
    attributeValues[`:${key}`] = fieldsObject[key];
    attributeNames[`#${index}`] = `${key}`;
  });

  return { attributeNames, attributeValues, expression };
}
