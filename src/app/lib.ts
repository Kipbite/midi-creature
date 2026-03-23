export interface MidiEvent {
	deltaTime: number
	type: string
	subtype: string
	velocity: number
	text?: string
	channel?: number
	noteNumber?: number
}

export interface MidiEventWithSegment extends MidiEvent {
	segment: number
}

export interface FoundNote {
	noteNumber: number
	eventIndex: number
}

export function findNoteRange( midiEvents: MidiEvent[] ):
[ FoundNote, FoundNote ] | undefined
{
	if ( ! midiEvents || ! midiEvents[0] ) {
		return;
	}

	let smallestNoteNumber: FoundNote | undefined = undefined;
	let largestNoteNumber: FoundNote | undefined = undefined;

	midiEvents.forEach( ( event, i ) => {
		if ( ! event.noteNumber ) {
			return;
		}

		if ( ! smallestNoteNumber || ! largestNoteNumber ) {
			smallestNoteNumber = {
				noteNumber: event.noteNumber,
				eventIndex: i
			};

			largestNoteNumber = {
				noteNumber: event.noteNumber,
				eventIndex: i
			};
		}

		if ( event.noteNumber < smallestNoteNumber.noteNumber ) {
			smallestNoteNumber = {
				noteNumber: event.noteNumber,
				eventIndex: i
			};
		}

		if ( event.noteNumber > largestNoteNumber.noteNumber ) {
			largestNoteNumber = {
				noteNumber: event.noteNumber,
				eventIndex: i
			};
		}
	} );

	if ( ! smallestNoteNumber || ! largestNoteNumber ) {
		return;
	}

	return [ smallestNoteNumber, largestNoteNumber ];
}

export function getNoteSegmentBorders(
	[ smallestNoteNumber, largestNoteNumber ]: [ FoundNote, FoundNote ],
	segmentAmounts = 4
): [number, number][] {
	const s = smallestNoteNumber.noteNumber;
	const l = largestNoteNumber.noteNumber;

	const difference = l - s;

	const segmentSize = difference / segmentAmounts;

	const segments: [number, number][] = [];

	for ( let i = 1; i < segmentAmounts + 1; i++ ) {
		segments.push( [
			Math.floor( s + ( segmentSize * ( i - 1 ) ) ),
			Math.floor( s + ( segmentSize * i ) )
		] );
	}

	return segments;
}

export function getNoteSegment(
	note: number,
	noteSegments: ReturnType<typeof getNoteSegmentBorders>
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

export interface FrameData {
	deltaTime: number
	image: string
}

export function getAnimationFrames( midiEvents: MidiEventWithSegment[] ) {
	const frames: FrameData[] = [];

	midiEvents.forEach( event => {
		const openType = event.subtype === 'noteOn' ? 'open' : 'closed';

		frames.push( {
			deltaTime: event.deltaTime,
			image: `./images/${ event.segment }_${ openType }.png`
		} );
	} );

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

	setTimeout( () => {
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