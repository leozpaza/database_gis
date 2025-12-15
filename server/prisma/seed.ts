import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gis-kb.ru' },
    update: {},
    create: {
      email: 'admin@gis-kb.ru',
      passwordHash: adminPassword,
      name: 'Администратор',
      role: 'ADMIN'
    }
  });

  // Create categories
  const categories = [
    { code: '12.14', name: 'Проблемы с уборкой подъезда', icon: 'Sparkles', description: 'Обращения по вопросам уборки и санитарного состояния подъездов' },
    { code: '12.1', name: 'Вандализм', icon: 'AlertTriangle', description: 'Обращения о повреждении общедомового имущества' },
    { code: '12.6', name: 'Неисправный домофон', icon: 'Phone', description: 'Обращения о проблемах с домофонной системой' },
    { code: '12.10', name: 'Проблемы с входной дверью', icon: 'DoorOpen', description: 'Обращения о неисправностях входных дверей подъездов' },
    { code: '11.4.6', name: 'Проблемы со счётчиками', icon: 'Gauge', description: 'Обращения по вопросам приборов учёта' },
    { code: '15.6', name: 'Предоставление отчёта', icon: 'FileText', description: 'Запросы отчётной документации' },
    { code: '5.6', name: 'Приборы учёта (ИПУ)', icon: 'Calculator', description: 'Обращения по индивидуальным приборам учёта' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: {
        code: cat.code,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').replace(/-+/g, '-'),
        icon: cat.icon,
        description: cat.description,
        sortOrder: categories.indexOf(cat)
      }
    });
  }

  // Create sample articles
  const cleaningCategory = await prisma.category.findUnique({ where: { code: '12.14' } });
  if (cleaningCategory) {
    await prisma.article.upsert({
      where: { slug: 'instrukciya-uborka-podezda' },
      update: {},
      create: {
        categoryId: cleaningCategory.id,
        title: 'Инструкция по обработке обращений об уборке подъезда',
        slug: 'instrukciya-uborka-podezda',
        summary: 'Пошаговая инструкция для операторов по обработке жалоб на качество уборки подъездов и мест общего пользования.',
        content: `# Обработка обращений об уборке подъезда

## 1. Классификация обращения
Определите тип жалобы:
- Нерегулярная уборка
- Некачественная уборка
- Отсутствие уборки

## 2. Проверка информации
1. Уточните адрес и номер подъезда
2. Проверьте график уборки по данному адресу
3. Запросите информацию у ответственного сотрудника

## 3. Формирование ответа
Используйте шаблон ответа, указав:
- Дату последней уборки
- График уборки
- Принятые меры

## 4. Нормативная база
- Постановление Правительства РФ № 491
- Правила содержания общего имущества`,
        responseTemplate: `Уважаемый(ая) {ФИО}!

По Вашему обращению № {номер_обращения} от {дата} сообщаем следующее.

Управляющей компанией проведена проверка качества уборки по адресу: {адрес}. 

График уборки мест общего пользования: ежедневно с 8:00 до 12:00.

По результатам проверки приняты следующие меры: проведён инструктаж с техническим персоналом, усилен контроль качества уборки.

С уважением,
Управляющая компания`,
        legalReference: 'п. 11 ПП РФ № 491',
        keywords: ['уборка', 'подъезд', 'чистота', 'мусор', 'грязь'],
        isPublished: true,
        authorId: admin.id
      }
    });
  }

  const intercomCategory = await prisma.category.findUnique({ where: { code: '12.6' } });
  if (intercomCategory) {
    await prisma.article.upsert({
      where: { slug: 'neispravnost-domofona' },
      update: {},
      create: {
        categoryId: intercomCategory.id,
        title: 'Обработка обращений о неисправности домофона',
        slug: 'neispravnost-domofona',
        summary: 'Инструкция по работе с обращениями о неисправностях домофонной системы.',
        content: `# Неисправность домофона

## Типичные проблемы
- Не работает связь с квартирой
- Не открывается дверь
- Сломана панель вызова
- Проблемы с ключами/брелоками

## Порядок действий
1. Зафиксируйте характер неисправности
2. Направьте заявку в техническую службу
3. Сообщите заявителю о сроках устранения

## Сроки устранения
- Аварийные неисправности: 24 часа
- Текущий ремонт: до 5 рабочих дней`,
        responseTemplate: `Уважаемый(ая) {ФИО}!

Ваше обращение о неисправности домофона по адресу {адрес} принято в работу.

Заявка передана в техническую службу. Ориентировочный срок устранения неисправности: {срок}.

Приносим извинения за доставленные неудобства.

С уважением,
Управляющая компания`,
        keywords: ['домофон', 'связь', 'дверь', 'ключ', 'брелок'],
        isPublished: true,
        authorId: admin.id
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
