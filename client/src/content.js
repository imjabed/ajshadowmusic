export const content = {
  artist: 'AJ SHADOW',
  project: { eyebrow: 'THE NEXT CHAPTER · 2027', title: 'THE CHASE', label: 'FIVE STORIES. ONE PURSUIT.', tagline: 'For those who never stop chasing.', videoUrl: '' },
  tracks: [
    { title: "If I Didn't Have You", artist: 'AJ Shadow', duration: '', audioUrl: '', link: '' },
    { title: "Let's Go Now", artist: 'AJ Shadow', duration: '', audioUrl: '', link: '' },
    { title: 'If I Could', artist: 'AJ Shadow', duration: '', audioUrl: '', link: '' }
  ],
  videos: [
    { title: 'THE CHASE', subtitle: 'PROJECT FILM', youtubeId: '' },
    { title: 'THE VISUALS', subtitle: 'MUSIC VIDEO', youtubeId: '' }
  ],
  labels: [{ name: 'Spiration Music', subtitle: 'RELEASE PARTNER' }, { name: 'Unted', subtitle: 'RELEASE PARTNER' }],
  socials: {
    youtube: import.meta.env.VITE_YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/@AJShadowmusic',
    instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/ajshadowmusic',
    spotify: import.meta.env.VITE_SPOTIFY_ARTIST_URL || '',
    soundcloud: import.meta.env.VITE_SOUNDCLOUD_URL || ''
  }
};