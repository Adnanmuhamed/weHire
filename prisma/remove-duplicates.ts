import { db as prisma } from '../lib/db';

async function main() {
  console.log('Cleaning up duplicate CompanyReviews...');
  const companyReviews = await prisma.companyReview.findMany({
    orderBy: { createdAt: 'asc' },
  });
  const seenCompany = new Set();
  let deletedCompany = 0;
  for (const r of companyReviews) {
    const key = `${r.authorId}-${r.companyId}`;
    if (seenCompany.has(key)) {
      await prisma.companyReview.delete({ where: { id: r.id } });
      deletedCompany++;
    } else {
      seenCompany.add(key);
    }
  }
  console.log(`Deleted ${deletedCompany} duplicate CompanyReviews.`);

  console.log('Cleaning up duplicate CandidateReviews...');
  const candidateReviews = await prisma.candidateReview.findMany({
    orderBy: { createdAt: 'asc' },
  });
  const seenCandidate = new Set();
  let deletedCandidate = 0;
  for (const r of candidateReviews) {
    const key = `${r.authorId}-${r.candidateId}`;
    if (seenCandidate.has(key)) {
      await prisma.candidateReview.delete({ where: { id: r.id } });
      deletedCandidate++;
    } else {
      seenCandidate.add(key);
    }
  }
  console.log(`Deleted ${deletedCandidate} duplicate CandidateReviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
