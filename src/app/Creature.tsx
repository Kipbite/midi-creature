"use client"

import { useEffect, useState } from "react";
import { findNoteRange, getAnimationFrames, getBpmFromPpq, getNoteSegment, getNoteSegmentBorders, getTickSpeedFromBpm, MidiEvent, MidiEventWithSegment, playFrame } from './lib';

interface Props {
	events: MidiEvent[]
	ppq: number
	ticksPerBeat: number
}

export default function Creature( { events, ppq, ticksPerBeat }: Props ) {
	const [ imgSrc, setImgSrc ] = useState( '#' );

	useEffect( () => {
		const bpm = getBpmFromPpq( ppq );
		const noteRange = findNoteRange( events );

		if ( ! noteRange ) {
			console.error( 'Could not find note range' );
			return;
		}

		const noteSegmentsBorders = getNoteSegmentBorders( noteRange );

		const notes: MidiEventWithSegment[] = [];

		try {
			events.forEach( event => {
				if ( event.noteNumber ) {
					const segment = getNoteSegment( event.noteNumber, noteSegmentsBorders );

					notes.push( {
						...event,
						segment
					} );
				}
			});
		} catch ( e ) {
			console.error( e );
		}

		const frames = getAnimationFrames( notes );

		const tickSpeed = getTickSpeedFromBpm( bpm, ticksPerBeat );

		playFrame( frames, setImgSrc, tickSpeed );
	}, [ events, ppq, ticksPerBeat ] );

	return (
		<img src={ imgSrc } style={{ maxWidth: '100%' }} />
	);
}