import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

async function main() {
  console.log('🌱 Seeding ICON CRM database...');

  const password = await hashPassword('password123');

  // Companies
  const iconServices = await prisma.company.upsert({
    where: { id: 'company-icon' },
    update: {},
    create: { id: 'company-icon', name: 'ICON SERVICES', email: 'admin@iconservices.com', phone: '+92 300 0000000', address: 'Lahore, Pakistan', website: 'https://iconservices.com' },
  });

  const alphaConstruction = await prisma.company.upsert({
    where: { id: 'company-alpha' },
    update: {},
    create: { id: 'company-alpha', name: 'Alpha Construction Ltd.', email: 'contact@alphaconstruction.com', phone: '+92 321 1234567', address: 'Karachi, Pakistan' },
  });

  const betaDevelopers = await prisma.company.upsert({
    where: { id: 'company-beta' },
    update: {},
    create: { id: 'company-beta', name: 'Beta Developers Group', email: 'info@betadev.com', phone: '+92 333 9876543', address: 'Islamabad, Pakistan' },
  });

  const ublCorp = await prisma.company.upsert({
    where: { id: 'company-ubl' },
    update: {},
    create: { id: 'company-ubl', name: 'UBL Corporate Estates', email: 'projects@ubl.com', phone: '+92 42 1112233', address: 'Lahore, Pakistan' },
  });

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iconservices.com' },
    update: {},
    create: { name: 'Ahmad Raza', email: 'admin@iconservices.com', password, role: 'ADMIN', companyId: iconServices.id },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@iconservices.com' },
    update: {},
    create: { name: 'Sara Khan', email: 'manager@iconservices.com', password, role: 'MANAGER', companyId: iconServices.id },
  });

  const employee1 = await prisma.user.upsert({
    where: { email: 'usman@iconservices.com' },
    update: {},
    create: { name: 'Usman Ali', email: 'usman@iconservices.com', password, role: 'EMPLOYEE', companyId: iconServices.id },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'fatima@iconservices.com' },
    update: {},
    create: { name: 'Fatima Malik', email: 'fatima@iconservices.com', password, role: 'EMPLOYEE', companyId: iconServices.id },
  });

  await prisma.user.upsert({
    where: { email: 'client@alphaconstruction.com' },
    update: {},
    create: { name: 'Bilal Ahmed', email: 'client@alphaconstruction.com', password, role: 'CLIENT', companyId: alphaConstruction.id },
  });

  // Teams
  const civilTeam = await prisma.team.upsert({
    where: { id: 'team-civil' },
    update: {},
    create: { id: 'team-civil', name: 'Civil & Structural', description: 'Handles all civil, structural, and foundation works' },
  });

  const mepTeam = await prisma.team.upsert({
    where: { id: 'team-mep' },
    update: {},
    create: { id: 'team-mep', name: 'MEP Team', description: 'Mechanical, Electrical & Plumbing specialists' },
  });

  // Team members
  for (const [teamId, userId] of [
    ['team-civil', employee1.id],
    ['team-mep', employee2.id],
    ['team-civil', manager.id],
  ]) {
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId } },
      update: {},
      create: { teamId, userId },
    });
  }

  // Projects — spread across Kanban columns
  const project1 = await prisma.project.upsert({
    where: { id: 'proj-residential' },
    update: {},
    create: {
      id: 'proj-residential', name: 'DHA Residential Complex — Block C',
      description: 'Full-scope construction of a 200-unit residential complex.',
      status: 'ONGOING', priority: 'HIGH',
      startDate: new Date('2026-01-15'), endDate: new Date('2026-12-31'),
      budget: 45000000, progress: 38, companyId: alphaConstruction.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'proj-commercial' },
    update: {},
    create: {
      id: 'proj-commercial', name: 'Gulberg Commercial Tower',
      description: 'High-rise 22-floor commercial tower with mixed-use spaces.',
      status: 'UNDER_CUSTOMER_REVIEW', priority: 'CRITICAL',
      startDate: new Date('2025-09-01'), endDate: new Date('2027-03-31'),
      budget: 180000000, progress: 62, companyId: betaDevelopers.id,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'proj-road' },
    update: {},
    create: {
      id: 'proj-road', name: 'Ring Road Extension — Phase 2',
      description: 'Extension of the Northern Ring Road spanning 14km.',
      status: 'CONTRACT_FILLED', priority: 'MEDIUM',
      startDate: new Date('2026-03-01'), endDate: new Date('2026-11-30'),
      budget: 92000000, progress: 12, companyId: alphaConstruction.id,
    },
  });

  const project4 = await prisma.project.upsert({
    where: { id: 'proj-ubl' },
    update: {},
    create: {
      id: 'proj-ubl', name: 'UBL Corporate HQ Renovation',
      description: 'Interior renovation of a 12-floor corporate headquarters.',
      status: 'UNDER_REVIEW', priority: 'MEDIUM',
      budget: 28000000, progress: 0, companyId: ublCorp.id,
    },
  });

  const project5 = await prisma.project.upsert({
    where: { id: 'proj-warehouse' },
    update: {},
    create: {
      id: 'proj-warehouse', name: 'Industrial Warehouse — Sundar',
      description: 'Steel-framed industrial warehouse, 50,000 sq ft.',
      status: 'COMPLETED', priority: 'LOW',
      startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'),
      budget: 35000000, progress: 100, companyId: alphaConstruction.id,
    },
  });

  // Domains for project1
  const civilDomain = await prisma.domain.upsert({
    where: { id: 'dom-civil' }, update: {},
    create: { id: 'dom-civil', name: 'Civil Works', color: '#6366f1', projectId: project1.id },
  });
  const elecDomain = await prisma.domain.upsert({
    where: { id: 'dom-elec' }, update: {},
    create: { id: 'dom-elec', name: 'Electrical Works', color: '#f59e0b', projectId: project1.id },
  });
  const plumbDomain = await prisma.domain.upsert({
    where: { id: 'dom-plumb' }, update: {},
    create: { id: 'dom-plumb', name: 'Plumbing Works', color: '#10b981', projectId: project1.id },
  });

  // Domains for project2
  await prisma.domain.upsert({
    where: { id: 'dom-struct' }, update: {},
    create: { id: 'dom-struct', name: 'Structural Works', color: '#8b5cf6', projectId: project2.id },
  });
  await prisma.domain.upsert({
    where: { id: 'dom-interior' }, update: {},
    create: { id: 'dom-interior', name: 'Interior Fit-Out', color: '#ec4899', projectId: project2.id },
  });

  // Tasks for project1 domains
  const task1 = await prisma.task.upsert({
    where: { id: 'task-foundation' }, update: {},
    create: { id: 'task-foundation', title: 'Foundation & Excavation', status: 'DONE', priority: 'CRITICAL', dueDate: new Date('2026-02-28'), domainId: civilDomain.id, assigneeId: employee1.id, creatorId: manager.id },
  });
  const task2 = await prisma.task.upsert({
    where: { id: 'task-columns' }, update: {},
    create: { id: 'task-columns', title: 'RCC Column Casting — G to 3F', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2026-07-15'), domainId: civilDomain.id, assigneeId: employee1.id, creatorId: manager.id },
  });
  const task4 = await prisma.task.upsert({
    where: { id: 'task-main-panel' }, update: {},
    create: { id: 'task-main-panel', title: 'Main Distribution Panel Installation', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date('2026-06-30'), domainId: elecDomain.id, assigneeId: employee2.id, creatorId: manager.id },
  });
  const task6 = await prisma.task.upsert({
    where: { id: 'task-water-supply' }, update: {},
    create: { id: 'task-water-supply', title: 'Water Supply Network — Block C', status: 'REVIEW', priority: 'HIGH', dueDate: new Date('2026-06-20'), domainId: plumbDomain.id, assigneeId: employee2.id, creatorId: manager.id },
  });

  // Subtasks
  const subtasks = [
    { id: 'sub-1',  title: 'Soil testing & geo report',       completed: true,  taskId: task1.id },
    { id: 'sub-2',  title: 'Excavation to design depth',      completed: true,  taskId: task1.id },
    { id: 'sub-3',  title: 'PCC lean concrete layer',         completed: true,  taskId: task1.id },
    { id: 'sub-4',  title: 'Rebar placement & inspection',    completed: true,  taskId: task1.id },
    { id: 'sub-5',  title: 'Concrete pour & curing',          completed: true,  taskId: task1.id },
    { id: 'sub-6',  title: 'Shuttering & centering',          completed: true,  taskId: task2.id },
    { id: 'sub-7',  title: 'Rebar cage fabrication',          completed: true,  taskId: task2.id },
    { id: 'sub-8',  title: 'Column casting — Ground Floor',   completed: false, taskId: task2.id },
    { id: 'sub-9',  title: 'Column casting — First Floor',    completed: false, taskId: task2.id },
    { id: 'sub-10', title: 'Load bank test',                  completed: false, taskId: task4.id },
    { id: 'sub-11', title: 'Panel mounting & termination',    completed: true,  taskId: task4.id },
    { id: 'sub-12', title: 'Pressure test (10 bar / 30 min)', completed: true,  taskId: task6.id },
    { id: 'sub-13', title: 'Flushing & disinfection',         completed: false, taskId: task6.id },
  ];

  for (const s of subtasks) {
    await prisma.subtask.upsert({ where: { id: s.id }, update: {}, create: s });
  }

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Credentials (all use password: password123)');
  console.log('  Admin:    admin@iconservices.com');
  console.log('  Manager:  manager@iconservices.com');
  console.log('  Employee: usman@iconservices.com');
  console.log('  Client:   client@alphaconstruction.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
