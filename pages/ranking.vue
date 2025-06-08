<script setup>
import CardRank from "~/components/rank/CardRank.vue";

// Path Data SVG untuk ikon
// Anda bisa mendapatkan ini dari situs seperti Heroicons, Feather Icons, dll.
const ICON_CLOCK = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z";
const ICON_STAR =
  "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z";

const rankedUsers = [
  {
    rank: 1,
    user: {
      name: "Lord Haikal",
      email: "haikal@adira.co.id",
      avatar: "https://i.pravatar.cc/150?u=haikal",
    },
    stats: [
      { label: "Finished Task", value: "8h", icon: ICON_CLOCK },
      { label: "Total Point", value: 120, icon: ICON_STAR },
    ],
  },
  {
    rank: 2,
    user: {
      name: "Budi Doremi",
      email: "budi.doremi@example.com",
      avatar: "https://i.pravatar.cc/150?u=budi",
    },
    stats: [
      { label: "Finished Task", value: "7h", icon: ICON_CLOCK },
      { label: "Total Point", value: 110, icon: ICON_STAR },
    ],
  },
  {
    rank: 3,
    user: {
      name: "Cinta Laura",
      email: "cinta.laura@example.com",
      avatar: "https://i.pravatar.cc/150?u=cinta",
    },
    stats: [
      { label: "Finished Task", value: "6h", icon: ICON_CLOCK },
      { label: "Total Point", value: 95, icon: ICON_STAR },
    ],
  },
  {
    rank: 4,
    user: {
      name: "Jamal",
      email: "jamal@example.com",
      avatar: "https://i.pravatar.cc/150?u=jamal",
    },
    stats: [
      { label: "Finished Task", value: "6h", icon: ICON_CLOCK },
      { label: "Total Point", value: 95, icon: ICON_STAR },
    ],
  },
  {
    rank: 5,
    user: {
      name: "Dewi Safitri",
      email: "dewi.s@example.com",
      avatar: "https://i.pravatar.cc/150?u=dewi",
    },
    stats: [
      { label: "Finished Task", value: "5h", icon: ICON_CLOCK },
      { label: "Total Point", value: 90, icon: ICON_STAR },
    ],
  },
  {
    rank: 6,
    user: {
      name: "Eko Prasetyo",
      email: "eko.p@example.com",
      avatar: "https://i.pravatar.cc/150?u=eko",
    },
    stats: [
      { label: "Finished Task", value: "5h", icon: ICON_CLOCK },
      { label: "Total Point", value: 88, icon: ICON_STAR },
    ],
  },
  {
    rank: 7,
    user: {
      name: "Fitriani",
      email: "fitriani@example.com",
      avatar: "https://i.pravatar.cc/150?u=fitriani",
    },
    stats: [
      { label: "Finished Task", value: "4h", icon: ICON_CLOCK },
      { label: "Total Point", value: 85, icon: ICON_STAR },
    ],
  },
  {
    rank: 8,
    user: {
      name: "Gilang Ramadhan",
      email: "gilang.r@example.com",
      avatar: "https://i.pravatar.cc/150?u=gilang",
    },
    stats: [
      { label: "Finished Task", value: "4h", icon: ICON_CLOCK },
      { label: "Total Point", value: 82, icon: ICON_STAR },
    ],
  },
  {
    rank: 9,
    user: {
      name: "Herawati",
      email: "herawati@example.com",
      avatar: "https://i.pravatar.cc/150?u=herawati",
    },
    stats: [
      { label: "Finished Task", value: "4h", icon: ICON_CLOCK },
      { label: "Total Point", value: 79, icon: ICON_STAR },
    ],
  },
  {
    rank: 10,
    user: {
      name: "Indra Kusuma",
      email: "indra.k@example.com",
      avatar: "https://i.pravatar.cc/150?u=indra",
    },
    stats: [
      { label: "Finished Task", value: "3h", icon: ICON_CLOCK },
      { label: "Total Point", value: 75, icon: ICON_STAR },
    ],
  },
  {
    rank: 11,
    user: {
      name: "Joko Susilo",
      email: "joko.s@example.com",
      avatar: "https://i.pravatar.cc/150?u=joko",
    },
    stats: [
      { label: "Finished Task", value: "3h", icon: ICON_CLOCK },
      { label: "Total Point", value: 71, icon: ICON_STAR },
    ],
  },
  {
    rank: 12,
    user: {
      name: "Kartika Sari",
      email: "kartika.s@example.com",
      avatar: "https://i.pravatar.cc/150?u=kartika",
    },
    stats: [
      { label: "Finished Task", value: "3h", icon: ICON_CLOCK },
      { label: "Total Point", value: 68, icon: ICON_STAR },
    ],
  },
  {
    rank: 13,
    user: {
      name: "Lia Amelia",
      email: "lia.a@example.com",
      avatar: "https://i.pravatar.cc/150?u=lia",
    },
    stats: [
      { label: "Finished Task", value: "2h", icon: ICON_CLOCK },
      { label: "Total Point", value: 65, icon: ICON_STAR },
    ],
  },
  {
    rank: 14,
    user: {
      name: "Muhammad Fajar",
      email: "m.fajar@example.com",
      avatar: "https://i.pravatar.cc/150?u=fajar",
    },
    stats: [
      { label: "Finished Task", value: "2h", icon: ICON_CLOCK },
      { label: "Total Point", value: 60, icon: ICON_STAR },
    ],
  },
  {
    rank: 15,
    user: {
      name: "Nadia Putri",
      email: "nadia.p@example.com",
      avatar: "https://i.pravatar.cc/150?u=nadia",
    },
    stats: [
      { label: "Finished Task", value: "2h", icon: ICON_CLOCK },
      { label: "Total Point", value: 57, icon: ICON_STAR },
    ],
  },
  {
    rank: 16,
    user: {
      name: "Oscar Maulana",
      email: "oscar.m@example.com",
      avatar: "https://i.pravatar.cc/150?u=oscar",
    },
    stats: [
      { label: "Finished Task", value: "2h", icon: ICON_CLOCK },
      { label: "Total Point", value: 55, icon: ICON_STAR },
    ],
  },
  {
    rank: 17,
    user: {
      name: "Putri Wulandari",
      email: "putri.w@example.com",
      avatar: "https://i.pravatar.cc/150?u=putriw",
    },
    stats: [
      { label: "Finished Task", value: "1h", icon: ICON_CLOCK },
      { label: "Total Point", value: 50, icon: ICON_STAR },
    ],
  },
  {
    rank: 18,
    user: {
      name: "Rizky Akbar",
      email: "rizky.a@example.com",
      avatar: "https://i.pravatar.cc/150?u=rizky",
    },
    stats: [
      { label: "Finished Task", value: "1h", icon: ICON_CLOCK },
      { label: "Total Point", value: 48, icon: ICON_STAR },
    ],
  },
  {
    rank: 19,
    user: {
      name: "Siti Nurhaliza",
      email: "siti.n@example.com",
      avatar: "https://i.pravatar.cc/150?u=siti",
    },
    stats: [
      { label: "Finished Task", value: "1h", icon: ICON_CLOCK },
      { label: "Total Point", value: 45, icon: ICON_STAR },
    ],
  },
  {
    rank: 20,
    user: {
      name: "Taufik Hidayat",
      email: "taufik.h@example.com",
      avatar: "https://i.pravatar.cc/150?u=taufik",
    },
    stats: [
      { label: "Finished Task", value: "1h", icon: ICON_CLOCK },
      { label: "Total Point", value: 42, icon: ICON_STAR },
    ],
  },
];
</script>

<template>
  <div class="mt-3">
    <div class="row g-4">
      <div
        v-for="(item, index) in rankedUsers"
        :key="item.rank"
        :style="{ 'animation-delay': `${index * 10 * 100}ms` }"
        class="col-lg-6 col-sm-12"
      >
        <CardRank :rank="item.rank" :stats="item.stats" :user="item.user" />
      </div>
    </div>
  </div>
</template>
