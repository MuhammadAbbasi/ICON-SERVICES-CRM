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
    create: {
      id: 'company-icon',
      name: 'ICON SERVICES',
      email: 'admin@iconservices.com',
      phone: '+92 300 0000000',
      address: 'Lahore, Pakistan',
      website: 'https://iconservices.com',
    },
  });

  const alphaConstruction = await prisma.company.upsert({
    where: { id: 'company-alpha' },
    update: {},
    create: {
      id: 'company-alpha',
      name: 'Alpha Construction Ltd.',
      email: 'contact@alphaconstruction.com',
      phone: '+92 321 1234567',
      address: 'Karachi, Pakistan',
    },
  });

  const betaDevelopers = await prisma.company.upsert({
    where: { id: 'company-beta' },
    update: {},
    create: {
      id: 'company-beta',
      name: 'Beta Developers Group',
      email: 'info@betadev.com',
      phone: '+92 333 9876543',
      address: 'Islamabad, Pakistan',
    },
  });

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iconservices.com' },
    update: {},
    create: {
      name: 'Ahmad Raza',
      email: 'admin@iconservices.com',
      password,
      role: 'ADMIN',
      companyId: iconServices.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@iconservices.com' },
    update: {},
    create: {
      name: 'Sara Khan',
      email: 'manager@iconservices.com',
      password,
      role: 'MANAGER',
      companyId: iconServices.id,
    },
  });

  const employee1 = await prisma.user.upsert({
    where: { email: 'usman@iconservices.com' },
    update: {},
    create: {
      name: 'Usman Ali',
      email: 'usman@iconservices.com',
      password,
      role: 'EMPLOYEE',
      companyId: iconServices.id,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'fatima@iconservices.com' },
    update: {},
    create: {
      name: 'Fatima Malik',
      email: 'fatima@iconservices.com',
      password,
      role: 'EMPLOYEE',
      companyId: iconServices.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'client@alphaconstruction.com' },
    update: {},
    create: {
      name: 'Bilal Ahmed',
      email: 'client@alphaconstruction.com',
      password,
      role: 'CLIENT',
      companyId: alphaConstruction.id,
    },
  });

  // Projects
  const project1 = await prisma.project.upsert({
    where: { id: 'proj-residential' },
    update: {},
    create: {
      id: 'proj-residential',
      name: 'DHA Residential Complex — Block C',
      description: 'Full-scope construction of a 200-unit residential complex including civil, electrical, and plumbing works.',
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-12-31'),
      budget: 45000000,
      progress: 38,
      companyId: alphaConstruction.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'proj-commercial' },
    update: {},
    create: {
      id: 'proj-commercial',
      name: 'Gulberg Commercial Tower',
      description: 'High-rise 22-floor commercial tower with mixed-use spaces. Interior fit-out phase commenced.',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2027-03-31'),
      budget: 180000000,
      progress: 62,
      companyId: betaDevelopers.id,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'proj-road' },
    update: {},
    create: {
      id: 'proj-road',
      name: 'Ring Road Extension — Phase 2',
      description: 'Extension of the Northern Ring Road spanning 14km with dual carriageway and service roads.',
      status: 'ON_HOLD',
      priority: 'MEDIUM',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-11-30'),
      budget: 92000000,
      progress: 12,
      companyId: alphaConstruction.id,
    },
  });

  // Domains for Project 1
  const civilDomain = await prisma.domain.upsert({
    where: { id: 'dom-civil' },
    update: {},
    create: {
      id: 'dom-civil',
      name: 'Civil Works',
      description: 'Structural and foundation work',
      color: '#6366f1',
      projectId: project1.id,
    },
  });

  const elecDomain = await prisma.domain.upsert({
    where: { id: 'dom-elec' },
    update: {},
    create: {
      id: 'dom-elec',
      name: 'Electrical Works',
      description: 'Wiring, panels, and external connections',
      color: '#f59e0b',
      projectId: project1.id,
    },
  });

  const plumbDomain = await prisma.domain.upsert({
    where: { id: 'dom-plumb' },
    update: {},
    create: {
      id: 'dom-plumb',
      name: 'Plumbing Works',
      description: 'Water supply, drainage, and sanitation',
      color: '#10b981',
      projectId: project1.id,
    },
  });

  // Domains for Project 2
  const structDomain = await prisma.domain.upsert({
    where: { id: 'dom-struct' },
    update: {},
    create: {
      id: 'dom-struct',
      name: 'Structural Works',
      color: '#8b5cf6',
      projectId: project2.id,
    },
  });

  const interiorDomain = await prisma.domain.upsert({
    where: { id: 'dom-interior' },
    update: {},
    create: {
      id: 'dom-interior',
      name: 'Interior Fit-Out',
      color: '#ec4899',
      projectId: project2.id,
    },
  });

  // Tasks
  const task1 = await prisma.task.upsert({
    where: { id: 'task-foundation' },
    update: {},
    create: {
      id: 'task-foundation',
      title: 'Foundation & Excavation',
      description: 'Complete excavation to 6m depth and lay reinforced concrete foundation.',
      status: 'DONE',
      priority: 'CRITICAL',
      dueDate: new Date('2026-02-28'),
      domainId: civilDomain.id,
      assigneeId: employee1.id,
      creatorId: manager.id,
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 'task-columns' },
    update: {},
    create: {
      id: 'task-columns',
      title: 'RCC Column Casting — G to 3F',
      description: 'Cast reinforced columns for ground to third floor.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2026-07-15'),
      domainId: civilDomain.id,
      assigneeId: employee1.id,
      creatorId: manager.id,
    },
  });

  const task3 = await prisma.task.upsert({
    where: { id: 'task-brickwork' },
    update: {},
    create: {
      id: 'task-brickwork',
      title: 'Brickwork & Masonry',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date('2026-09-30'),
      domainId: civilDomain.id,
      assigneeId: employee2.id,
      creatorId: manager.id,
    },
  });

  const task4 = await prisma.task.upsert({
    where: { id: 'task-main-panel' },
    update: {},
    create: {
      id: 'task-main-panel',
      title: 'Main Distribution Panel Installation',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2026-06-30'),
      domainId: elecDomain.id,
      assigneeId: employee2.id,
      creatorId: manager.id,
    },
  });

  const task5 = await prisma.task.upsert({
    where: { id: 'task-conduit' },
    update: {},
    create: {
      id: 'task-conduit',
      title: 'Conduit & Cable Pulling',
      status: 'TODO',
      priority: 'MEDIUM',
      domainId: elecDomain.id,
      assigneeId: employee1.id,
      creatorId: manager.id,
    },
  });

  const task6 = await prisma.task.upsert({
    where: { id: 'task-water-supply' },
    update: {},
    create: {
      id: 'task-water-supply',
      title: 'Water Supply Network — Block C',
      status: 'REVIEW',
      priority: 'HIGH',
      dueDate: new Date('2026-06-20'),
      domainId: plumbDomain.id,
      assigneeId: employee2.id,
      creatorId: manager.id,
    },
  });

  // Subtasks
  await prisma.subtask.createMany({
    skipDuplicates: true,
    data: [
      { id: 'sub-1', title: 'Soil testing & geo report', completed: true, taskId: task1.id },
      { id: 'sub-2', title: 'Excavation to design depth', completed: true, taskId: task1.id },
      { id: 'sub-3', title: 'PCC lean concrete layer', completed: true, taskId: task1.id },
      { id: 'sub-4', title: 'Rebar placement & inspection', completed: true, taskId: task1.id },
      { id: 'sub-5', title: 'Concrete pour & curing', completed: true, taskId: task1.id },
      { id: 'sub-6', title: 'Shuttering & centering', completed: true, taskId: task2.id },
      { id: 'sub-7', title: 'Rebar cage fabrication', completed: true, taskId: task2.id },
      { id: 'sub-8', title: 'Column casting — Ground Floor', completed: false, taskId: task2.id },
      { id: 'sub-9', title: 'Column casting — First Floor', completed: false, taskId: task2.id },
      { id: 'sub-10', title: 'Load bank test', completed: false, taskId: task4.id },
      { id: 'sub-11', title: 'Panel mounting & termination', completed: true, taskId: task4.id },
      { id: 'sub-12', title: 'Pressure test (10 bar / 30 min)', completed: true, taskId: task6.id },
      { id: 'sub-13', title: 'Flushing & disinfection', completed: false, taskId: task6.id },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin:    admin@iconservices.com    / password123');
  console.log('  Manager:  manager@iconservices.com  / password123');
  console.log('  Employee: usman@iconservices.com    / password123');
  console.log('  Client:   client@alphaconstruction.com / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
