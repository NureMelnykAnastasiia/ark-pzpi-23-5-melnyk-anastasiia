import { CareLogRepository } from '../repositories/care-log.repository';
import { CreateCareLogDto, UpdateCareLogDto } from '../schemas/care-log.schema';
import { db } from '../db';
import { careTasks } from '../db/schema';
import { eq } from 'drizzle-orm';

export class CareLogService {
  private repo = new CareLogRepository();

  async getAll() { return await this.repo.findAll(); }
  async getById(id: string) { return await this.repo.findById(id); }
  async getByPlantId(id: string) { return await this.repo.findByPlantId(id); }

  async create(data: CreateCareLogDto, userId: string, userRole: string) {
    let finalPlantId = data.plantId;
    let finalType = data.type;

    // 1. Якщо це виконання конкретного завдання
    if (data.taskId) {
      const task = await db.query.careTasks.findFirst({
        where: eq(careTasks.id, data.taskId)
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // АВТОМАТИЗАЦІЯ: Беремо ID рослини та Тип із завдання
      finalPlantId = task.plantId;
      
      if (!finalType) {
        finalType = task.type;
      }

      // Перевірка прав
      const canExecute = 
        userRole === 'ADMIN' || 
        userRole === 'FLORIST' || 
        task.requiredRole === userRole;

      if (!canExecute) {
        throw new Error('Access denied: You cannot perform this task');
      }

      if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
        throw new Error('Task is already closed');
      }
    }

    // 2. Валідація фінальних даних
    if (!finalPlantId) {
      throw new Error('Plant ID is required (either explicitly or via taskId)');
    }
    if (!finalType) {
      throw new Error('Type is required (either explicitly or via taskId)');
    }

    // 3. Транзакція
    return await db.transaction(async (tx) => {
      // А. Створюємо лог
      // FIXED: Прибрали [ ] навколо newLog, бо repo.create повертає об'єкт
      const newLog = await this.repo.create({
        ...data,
        plantId: finalPlantId,
        type: finalType as any,
        performedByUserId: userId,
      }, tx);

      // Б. Закриваємо завдання, якщо воно було
      if (data.taskId) {
        await tx.update(careTasks)
          .set({ 
            status: 'COMPLETED',
            updatedAt: new Date()
          })
          .where(eq(careTasks.id, data.taskId));
      }

      return newLog;
    });
  }

  async update(id: string, data: UpdateCareLogDto) {
    await this.getById(id);
    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);
    return await this.repo.delete(id);
  }
}