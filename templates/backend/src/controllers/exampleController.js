import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example CRUD operations
export const getAll = async (req, res, next) => {
  try {
    const items = await prisma.user.findMany();
    res.json({ data: items, count: items.length });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.user.findUnique({ where: { id } });
    
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const item = await prisma.user.create({
      data: req.body
    });
    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.user.update({
      where: { id },
      data: req.body
    });
    res.json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
