import jsonwebtoken from 'jsonwebtoken';

console.log('Admin token:');
console.log(jsonwebtoken.sign(
  { extraPayload: { ticketId: 'invitationId' } },
  process.env.JWT_SECRET,
  {
    algorithm: process.env.JWT_ALGO,
  },
));

console.log('\n');

console.log('Voter token:');
console.log(jsonwebtoken.sign(
  { extraPayload: { ticketId: 'invitationId' } },
  process.env.JWT_SECRET,
  {
    algorithm: process.env.JWT_ALGO,
  },
));
