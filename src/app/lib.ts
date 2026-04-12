export type MidiEvent = MidiNoteEvent|MidiSetTempoEvent;

export interface MidiNoteEvent {
	deltaTime: number
	type: string
	subtype: string
	velocity: number
	text?: string
	channel?: number
	noteNumber?: number
}

export interface MidiSetTempoEvent {
  deltaTime: number
  type: 'meta'
  subtype: 'setTempo'
  microsecondsPerBeat: number
}

export interface MidiHeader {
	formatType: number
	trackCount: number
	ticksPerBeat: number
}

export interface MidiEventWithSegment extends MidiNoteEvent {
	noteSegment: number
	velocitySegment: number
}

export interface FoundNote {
	note: string|number
	eventIndex: number
}

export interface FrameData {
	deltaTime: number
	image: string
}

export function findNoteRange(
	midiEvents: MidiNoteEvent[],
	key: keyof MidiNoteEvent
):
[ FoundNote, FoundNote ] | undefined
{
	if ( ! midiEvents || ! midiEvents[0] ) {
		return;
	}

	let smallest: FoundNote | undefined = undefined;
	let largest: FoundNote | undefined = undefined;

	midiEvents.forEach( ( event, i ) => {
		if ( typeof event[key] === 'undefined' ) {
			return;
		}

		if ( ! smallest || ! largest ) {
			smallest = {
				note: event[key],
				eventIndex: i
			};

			largest = {
				note: event[key],
				eventIndex: i
			};
		}

		if ( event[key] < smallest.note ) {
			smallest = {
				note: event[key],
				eventIndex: i
			};
		}

		if ( event[key] > largest.note ) {
			largest = {
				note: event[key],
				eventIndex: i
			};
		}
	} );

	if ( ! smallest || ! largest ) {
		return;
	}

	return [ smallest, largest ];
}

export function getSegmentBorders(
	[ smallest, largest ]: [ FoundNote, FoundNote ],
	segmentAmounts = 4
): [number, number][] {
	if ( typeof smallest.note === 'string' || typeof largest.note === 'string' ) {
		throw new Error( 'Strings passed as smallest, largest' );
	}

	const s = smallest.note;
	const l = largest.note;
	
	console.log( 's: ', s );
	console.log( 'l: ', l );

	const difference = l - s;

	console.log( 'difference: ', difference );

	const segmentSize = difference / segmentAmounts;

	console.log( 'segmentSize: ', segmentSize );

	const segments: [number, number][] = [];

	console.log( 'segments: ', segments );

	for ( let i = 1; i < segmentAmounts + 1; i++ ) {
		segments.push( [
			Math.floor( s + ( segmentSize * ( i - 1 ) ) ),
			Math.floor( s + ( segmentSize * i ) )
		] );
	}

	console.log( '--- ' );

	return segments;
}

export function getNoteSegment(
	note: number,
	noteSegments: ReturnType<typeof getSegmentBorders>
) {
	let foundSegmentIndex: number | undefined = undefined;

	noteSegments.forEach( ( segment, i ) => {
		if ( note >= segment[0] && note <= segment[1] ) {
			foundSegmentIndex = i;
		}
	} );

	if ( typeof foundSegmentIndex === 'undefined' ) {
		throw new Error( "Note outside segment range" );
	}

	return foundSegmentIndex;
}

export function areEyesClosed( event: MidiEventWithSegment ) {
	return event.velocitySegment === 4 && event.subtype === 'noteOn';
}

export function getAnimationFrames( midiEvents: MidiEventWithSegment[] ) {
	const frames: FrameData[] = [];

	let shouldBlink = false;
	midiEvents.forEach( ( event, i ) => {
		const mouthOpenType = event.subtype === 'noteOn' ? 'open' : 'closed';

		if ( i % 20 === 0 ) {
			shouldBlink = true;
		}

		const blinking = shouldBlink && midiEvents[i-1]?.deltaTime > 50;

		const eyesOpenType = areEyesClosed( event ) || blinking ? 'eyesclosed' : 'eyesopen';
	
		if ( blinking ) {
			shouldBlink = false;
		}
		
		frames.push( {
			deltaTime: event.deltaTime,
			image: `./images/${ event.noteSegment }_${ mouthOpenType }_${ eyesOpenType }.png`
		} );

	} );
	
	console.log( 'frames: ', frames );
	return frames;
}

export function playFrame(
	frames: FrameData[],
	updateImage: ( imageSrc: string ) => void,
	tickSpeed: number,
	index: number = 0
) {
	if ( ! frames[index] ) {
		return;
	}

	return setTimeout( () => {
		if ( frames[index] ) {
			// console.log( `Playing frame ${index}: ${frames[index].image}` )
			updateImage( frames[index].image );
		} else {
			console.error( `Frame ${ index } not found` );
		}

		if ( frames[index + 1] ) {
			playFrame( frames, updateImage, tickSpeed, index + 1 );
		}
	}, frames[index].deltaTime * tickSpeed );

	// console.log( `Waiting for ${ frames[index].deltaTime * tempo } milliseconds` );
}

export function getTickSpeed(
	ppq: number,
	ticksPerBeat: number
) {
	const µsPerTick = ppq / ticksPerBeat
	const msPerTick = µsPerTick / 1000

	return msPerTick;
}

export function getTickSpeedFromBpm(
	bpm: number,
	ticksPerBeat: number
) {
	const ppq = getPpqFromBpm( bpm );
	const tickSpeed = getTickSpeed( ppq, ticksPerBeat );

	return tickSpeed;
}

export function getBpmFromPpq(
	ppq: number // aka microsecondsPerBeat
) {
	const bpm = 60000000 / ppq;
	return bpm;
}

export function getPpqFromBpm(
	bpm: number
) {
	const ppq = 60000000 / bpm;
	return ppq;
}

export function findSetTempoEvent( events: MidiEvent[] ) {
	const setTempoEvent = events.find(
		event => event.subtype === 'setTempo'
	);
	return setTempoEvent as MidiSetTempoEvent;
}

export async function readFileFromUrl( url: string ) {
	try {
		const res = await fetch(url, {
			headers: {
				Accept: "audio/midi",
			}
		});
		const blob = await res.blob();
		return new File([blob], "midi-file");
	} catch (e) {
		return console.error(e);
	}
}