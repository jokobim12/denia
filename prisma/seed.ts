import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear database
  await prisma.photo.deleteMany({});
  await prisma.letter.deleteMany({});
  await prisma.timeline.deleteMany({});
  await prisma.playlist.deleteMany({});

  // Seed Photos (Pap / Selfies)
  await prisma.photo.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        title: 'Pose Peace ✌️',
        description: 'Katanya dandan rapi hari ini, makanya kirim pap muka ngantuk tapi tetep super lucu.',
        eventDate: new Date('2025-05-15'),
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        title: 'Kacamata Baru 👓',
        description: 'Pamer kacamata bulat baru katanya biar keliatan pinter. Tapi malah keliatan makin gemes sih.',
        eventDate: new Date('2025-06-20'),
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        title: 'Pipinya Merah 🌸',
        description: 'Kedinginan pas lagi jalan-jalan sore. Katanya hidung sama pipinya sampai merona merah kaya tomat.',
        eventDate: new Date('2025-09-10'),
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
        title: 'Senyum Manis 😊',
        description: 'Senyum andalan kalau lagi dapet kabar bahagia. Matanya sampai ikutan sipit saking bahagianya.',
        eventDate: new Date('2025-11-05'),
      },
    ],
  });

  // Seed Letters
  await prisma.letter.createMany({
    data: [
      {
        title: 'Pelukan Virtual untuk Hari yang Mendung',
        content: 'Hei,\n\nTidak apa-apa jika hari ini rasanya berat dan dunia luar begitu berisik. Menangis bukanlah tanda kelemahan, melainkan bukti bahwa kamu sudah bertahan dengan sangat baik. Tarik napas perlahan, buat secangkir teh hangat, dan ingatlah bahwa ada seseorang di sini yang selalu percaya padamu.\n\nHari esok akan membawa cahaya baru. Istirahatlah yang cukup ya.',
        category: 'sad',
      },
      {
        title: 'Istirahat Sejenak, Kamu Sudah Berjuang Hebat',
        content: 'Halo Pejuang Tangguh,\n\nLetakkan semua beban pekerjaan dan pikiranmu malam ini. Kamu tidak harus menyelesaikan semua hal hari ini juga. Tubuhmu butuh jeda, pikiranmu butuh ketenangan.\n\nPejamkan matamu, dengarkan lagu favoritmu, dan tidurlah dengan nyenyak. Kamu sudah melakukan yang terbaik hari ini. Aku bangga padamu.',
        category: 'tired',
      },
      {
        title: 'Simpan Senyuman Ini Selamanya',
        content: 'Hai Manis,\n\nAku sangat senang melihat tawamu hari ini! Senyummu adalah salah satu hal terindah yang bisa mencerahkan hari siapa saja yang melihatnya. Simpanlah energi positif ini baik-baik.\n\nJika suatu hari nanti kamu lupa bagaimana rasanya bahagia, bacalah kembali surat ini dan ingatlah momen indah saat ini. Teruslah bersinar!',
        category: 'happy',
      },
      {
        title: 'Penyemangat Terbesarmu Ada di Sini',
        content: 'Semangat ya!,\n\nKamu adalah salah satu orang terkuat dan paling berbakat yang pernah aku kenal. Jangan biarkan keraguan kecil menghalangi langkah besarmu. Hambatan hari ini hanyalah anak tangga menuju kesuksesanmu esok hari.\n\nKamu pasti bisa melaluinya. Jika kamu butuh bantuan atau sekadar teman mengobrol, aku hanya berjarak satu pesan saja. Go get \'em!',
        category: 'cheer',
      },
    ],
  });

  // Seed Timeline (Wishes/Notes)
  await prisma.timeline.createMany({
    data: [
      {
        title: 'Pengingat Hangat',
        description: 'Kamu berharga dan luar biasa. Ingatlah itu setiap kali kamu mulai meragukan kekuatan dirimu sendiri.',
        imageUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80',
        eventDate: new Date(),
      },
      {
        title: 'Pesan Semangat',
        description: 'Semoga harimu hari ini dipenuhi dengan tawa-tawa kecil, kopi yang hangat, dan hal-hal baik yang tidak terduga.',
        imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80',
        eventDate: new Date(),
      },
      {
        title: 'Rehat Sejenak',
        description: 'Tidak apa-apa jika hari ini kamu tidak menjadi produktif. Terkadang, sekadar bertahan hidup dan bernapas dengan tenang adalah sebuah pencapaian yang besar.',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        eventDate: new Date(),
      },
      {
        title: 'Percayalah Pada Prosesmu',
        description: 'Setiap langkah kecil yang kamu ambil hari ini adalah kemajuan yang nyata. Kamu sudah berjalan sejauh ini, banggalah pada dirimu!',
        imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
        eventDate: new Date(),
      },
    ],
  });

  // Seed Playlists
  await prisma.playlist.createMany({
    data: [
      {
        title: 'Acoustic Warmth (Lofi & Chill)',
        embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator',
      },
      {
        title: 'Rainy Day Melodies (Indie-Folk)',
        embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4t886t16t7H?utm_source=generator',
      },
    ],
  });

  console.log('Seeding database completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
