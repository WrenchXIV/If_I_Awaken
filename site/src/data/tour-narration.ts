// Voice A — short, sensory, first-person prose used in tour mode.
// One arrival line + one body line per space. Edit any of these freely.
// These are NOT lifted from the script; they are evocative placeholders that
// can be replaced with Tour Guide lines from the script when ready.

import type { SpaceId } from '@/types';

export interface TourNarration {
  arrival: string;       // first sentence — the sensory hit on entering
  body: string;          // second sentence(s) — what unfolds
  continueLabel: string; // CTA text for the Continue door
}

export const TOUR_NARRATION: Record<SpaceId, TourNarration> = {
  lounge: {
    arrival:
      'You arrive at a warehouse on the edge of the Arts District. The marquee is hot with bulbs. A red carpet runs the length of the courtyard.',
    body:
      'A photographer is calling pose, click, next. The bar is already going inside, brass-warm and loud. Old Hollywood is laid lightly over the brick.',
    continueLabel: 'Step through the door',
  },
  'space-1': {
    arrival:
      'You step into a long, narrow corridor. The west wall is alive — a hundred and ten feet of LED holding Hollywood Boulevard at golden hour.',
    body:
      'Tourists are everywhere with cameras, maps, fanny packs. They greet you, point at landmarks, laugh too loud. The Walk of Fame glows under your feet. A man with a microphone says, "Welcome aboard, folks."',
    continueLabel: 'Follow the tour bus',
  },
  'space-2': {
    arrival:
      'You step into a courtyard ringed with stone tables. The light shifts to warmer gold. Mariachi crackles from a payphone that shouldn\'t still work.',
    body:
      'A market unfolds around you — taco stand, paletero cart, fruit vendor, lowrider on a slow loop. A young poet stands on one side of the circle. An older poet stands on the other. They are about to speak past each other and to each other at the same time.',
    continueLabel: 'Cross the courtyard',
  },
  'space-3': {
    arrival:
      'Five elevated stages curve in an arc around you. Each one is a doorway: Chinatown, Little Tokyo, Koreatown, Historic Filipinotown, Thai Town.',
    body:
      'A single performer moves between them. As she steps onto each stage, that town wakes — a dancer in costume, a thread of music, a story. Five neighborhoods in one breath.',
    continueLabel: 'Walk to the next town',
  },
  'space-4': {
    arrival:
      'A church sits against the west wall. Real pews. A pulpit. A choir loft. The quiet is sudden after the streets.',
    body:
      'Then the room expands behind you — four zones of Black Los Angeles unfold in sequence: the Great Migration, the jazz era, the hip-hop era, present-day Leimert Park. The choir comes in. The room becomes a dance floor and then a stage and then a sermon and then a song.',
    continueLabel: 'Cross the threshold',
  },
  'space-5': {
    arrival:
      'You walk through a 1970s front door into a living room. Records on the floor. Macramé. A persian rug. Vintage speakers softly hissing.',
    body:
      'A singer-songwriter sits on the couch with an acoustic guitar. The room is the kind of intimate where nobody asks you to applaud. Outside the windows, the canyon is in shadow.',
    continueLabel: 'Step out of the canyon',
  },
  'space-6': {
    arrival:
      'You enter a real theatre. Pristine. Classical. A proscenium frame. Walnut deck, raised pit, eight rows of seats facing forward.',
    body:
      'For the first time tonight, you sit. The lights shift. The full company assembles on the stage. The scrim lifts. The whole show, condensed, is about to play in front of you.',
    continueLabel: 'Take your seat',
  },
  'space-7': {
    arrival:
      'The lights come up. You walk back through the corridor where the show began.',
    body:
      'But Hollywood Boulevard is gone. The 110-foot LED wall is now a mosaic — your face, the stranger\'s face beside you, every face from tonight, composed into the city itself. You stop. You linger. You take a photo. The city does the talking.',
    continueLabel: 'Walk into the lobby',
  },
};
