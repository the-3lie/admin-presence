'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  username: z.string().min(3, "Nom d'utilisateur trop court"),
  password: z.string().min(6, 'Mot de passe trop court (6 caractères minimum)')
});

export async function creerCompte(formData: FormData) {
  const data = schema.parse(Object.fromEntries(formData));

  const existant = await prisma.user.findUnique({ where: { username: data.username } });
  if (existant) {
    return { success: false, message: 'Ce nom d’utilisateur existe déjà' };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({ data: { username: data.username, passwordHash } });

  return { success: true };
}

const schemaAgent = z.object({
  matricule: z.string().min(1, 'Le matricule est obligatoire'),
  password: z.string().min(6, 'Mot de passe trop court (6 caractères minimum)')
});

/**
 * Auto-inscription d'un agent : le matricule doit correspondre à une fiche
 * Personnel existante (créée au préalable par l'administration) et ne pas
 * être déjà rattaché à un compte. Le nom d'utilisateur du compte créé est
 * le matricule lui-même.
 */
export async function creerCompteAgent(formData: FormData) {
  const data = schemaAgent.parse(Object.fromEntries(formData));

  const agent = await prisma.personnel.findUnique({ where: { matricule: data.matricule } });
  if (!agent) {
    return { success: false, message: 'Aucun agent ne correspond à ce matricule. Contactez votre administration.' };
  }

  const compteExistant = await prisma.user.findFirst({
    where: { OR: [{ username: data.matricule }, { personnelId: agent.id }] }
  });
  if (compteExistant) {
    return { success: false, message: 'Un compte existe déjà pour ce matricule. Utilisez plutôt la connexion.' };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: { username: data.matricule, passwordHash, role: 'AGENT', personnelId: agent.id }
  });

  return { success: true };
}
