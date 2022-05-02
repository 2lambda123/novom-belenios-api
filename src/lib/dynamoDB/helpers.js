import { v4 as uuid } from 'uuid';

/**
 * Create an array from provided elements and flatten elements of type Array.
 *
 * It uses secondary keys stored inside the array to map the
 * DynamoDB elements back into their original places.
 *
 * @param {Array} elements
 * @param {Array} array
 * @returns {Array}
 */
export function mapElementsToArray(elements, array) {
  return array.map((item) => {
    if (Array.isArray(item)) {
      return mapElementsToArray(elements, item);
    }
    const ourEntity = elements.find((entity) => entity.id === item);
    return ourEntity;
  });
}

/**
 * Build delete requests for the elements in 'array'.
 *
 * @param {String} type
 * @param {Array} array
 * @returns {Array}
 */
export function buildDeleteRequests(type, array) {
  return array.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return [...acc, ...buildDeleteRequests(item)];
    }

    return [
      ...acc,
      {
        DeleteRequest: {
          Key: { id: item.id || item, type },
        },
      },
    ];
  }, []);
}

export function buildPutRequests(parentId, type, array = []) {
  return array.reduce(({ newItems, putRequests }, item) => {
    const newItem = {
      ...item,
      id: item.id || `${type}_${uuid()}`,
      parentId,
      type,
    };

    return {
      newItems: [...newItems, newItem],
      putRequests: [
        ...putRequests,
        {
          PutRequest: {
            Item: newItem,
          },
        },
      ],
    };
  }, { newItems: [], putRequests: [] });
}
