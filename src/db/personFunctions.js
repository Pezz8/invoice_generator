import prisma from './prismaClient.js';

// Create a Person
export async function createPerson(name, email) {
  return await prisma.people.create({
    data: {
      name,
      email,
    },
  });
}

// Find a Person by Email
export async function findPersonByEmail(email) {
  return await prisma.people.findUnique({
    where: {
      email: email,
    },
  });
}

// List all People
export async function listPeople() {
  return await prisma.people.findMany();
}

// Update a Person's Name and Email by ID
export async function updatePerson(personId, newName, newEmail) {
  return await prisma.people.update({
    where: { id: personId },
    data: {
      name: newName,
      email: newEmail,
    },
  });
}

// Delete a Person
export async function deletePerson(personId) {
  return await prisma.people.delete({
    where: { id: personId },
  });
}
