import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const sounds = [
 ['Gentle Rain','Nature','rain','Soft rainfall for deep concentration.'],
 ['Ocean Waves','Nature','waves','Slow coastal waves.'],
 ['Forest Morning','Nature','forest','Birds and a quiet forest ambience.'],
 ['Waterfall','Nature','waterfall','Steady rushing water.'],
 ['Mountain Wind','Nature','wind','Air moving through a mountain pass.'],
 ['Songbirds','Nature','birds','Light birdsong in a garden.'],
 ['Coffee Shop','Environment','coffee','Warm café room tone.'],
 ['Quiet Library','Environment','library','A quiet study-room atmosphere.'],
 ['Fireplace','Environment','fire','Crackling fire ambience.'],
 ['Night City','Environment','city','Soft distant city hum.'],
 ['Train Journey','Environment','train','Rhythmic travel ambience.'],
 ['White Noise','Noise','white','Broadband white noise.'],
 ['Brown Noise','Noise','brown','Deep, soothing brown noise.'],
 ['Pink Noise','Noise','pink','Balanced pink noise.'],
 ['Deep Space','Atmosphere','space','Low cinematic space drone.'],
 ['Focus Drone','Atmosphere','drone','A steady tonal focus bed.'],
 ['Piano Calm','Music','piano','Gentle generated piano-like tones.'],
 ['Lo-fi Study','Music','lofi','A mellow lo-fi inspired sound bed.'],
 ['Soft Synth','Music','synth','Warm, slow synthesizer pads.'],
 ['Meditation Bowl','Music','bowl','Resonant meditative tones.'],
 ['Rain on Window','Nature','windowrain','Rain pattering on glass.'],
 ['Summer Night','Nature','crickets','Crickets and evening ambience.'],
 ['Underwater','Atmosphere','underwater','Muted, submerged ambience.'],
 ['Dreamscape','Music','dream','Airy ambient tones for reading.']
];
async function main() {
 for (const [name, category, key, description] of sounds) {
   await prisma.sound.upsert({
     where:{name},
     update:{category, audioUrl:`generated:${key}`, imageUrl:'', description},
     create:{name, category, audioUrl:`generated:${key}`, imageUrl:'', description}
   });
 }
 console.log(`Seeded ${sounds.length} sound tracks.`);
}
main().finally(()=>prisma.$disconnect());
