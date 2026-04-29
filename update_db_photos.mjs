import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://uljzuzdpdafpmzcekxpw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsanp1emRwZGFmcG16Y2VreHB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg1Mjg0MCwiZXhwIjoyMDkyNDI4ODQwfQ.A26FkTrJZ0bENlwkkKlt-ZssE06IfvxBMprX2f4V0I8');

const desc = "Hoveniersbedrijf A/Z bestaat al meer dan 15 jaar en heeft in die tijd een groot vast klantenbestand opgebouwd. Wij werken voor zowel particulieren als bedrijven in de regio. Of het nu gaat om het aanleggen van een compleet nieuwe tuin, het onderhouden van uw bestaande groen of het plaatsen van een schutting - u kunt op ons rekenen.\n\nWij werken nauw samen met opdrachtgevers \u2014 particulier en zakelijk \u2014 om tuinen te creëren die bij u passen. Wat wij niet zelf kunnen, regelen wij via een betrouwbaar netwerk van vakpartners.";

async function run() {
  const { data, error } = await supabase.from('leads').update({
    description: desc,
    logo_url: '/images/hoveniersbedrijf-az/hbaz.png',
    photos: [
      '/images/hoveniersbedrijf-az/part_tuin_blok_2_groot.jpg',
      '/images/hoveniersbedrijf-az/50-50_tegel_blokl_tuin_groot.jpg',
      '/images/hoveniersbedrijf-az/appelteren_waterleeuw_groot.jpg',
      '/images/hoveniersbedrijf-az/bonsai_olea_1.jpg',
      '/images/hoveniersbedrijf-az/grondwerk_pulles_af_groot.jpg',
      '/images/hoveniersbedrijf-az/hek2.jpg',
      '/images/hoveniersbedrijf-az/voorjaar_tuin_gert_groot.jpg',
      '/images/hoveniersbedrijf-az/zomer_2008_014.jpg'
    ]
  }).eq('slug', 'hoveniersbedrijf-az');
  console.log(error || 'Success DB');
}

run();
