const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const userId = 'guest-user-1'

    await prisma.user.upsert({
        where: { email: 'guest@ritual.app' },
        update: {},
        create: {
            id: userId,
            email: 'guest@ritual.app',
            name: 'Guest User',
            timezone: 'UTC',
        },
    })

    const habits = [
        { name: 'Morning Meditation', color: '#8b5cf6', frequency: 'DAILY', goalType: 'BINARY' },
        { name: 'Stay Hydrated (2L)', color: '#3b82f6', frequency: 'DAILY', goalType: 'BINARY' },
        { name: 'Physical Exercise', color: '#ef4444', frequency: 'DAILY', goalType: 'BINARY' },
        { name: 'Read 10 Pages', color: '#10b981', frequency: 'DAILY', goalType: 'BINARY' },
    ]

    for (const h of habits) {
        await prisma.habit.create({
            data: {
                ...h,
                userId,
            }
        })
    }

    console.log('Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
