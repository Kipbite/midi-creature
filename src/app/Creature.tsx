"use client"

import { useEffect, useState } from "react";
import { findNoteRange, getAnimationFrames, getNoteSegment, getNoteSegmentBorders, MidiEvent, MidiEventWithSegment, playFrame } from './lib';

interface Props {
	events: MidiEvent[]
	tickSpeed: number
}

export default function Creature( { events, tickSpeed }: Props ) {
	const [ imgSrc, setImgSrc ] = useState( '#' );

	useEffect( () => {
		const noteRange = findNoteRange( events );

		if ( ! noteRange ) {
			console.error( 'Could not find note range' );
			return;
		}

		const noteSegmentsBorders = getNoteSegmentBorders( noteRange );

		console.log( 'noteRange: ', noteRange );

		console.log( 'noteSegmentsBorders: ', noteSegmentsBorders );

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

		console.log( 'tickSpeed: ', tickSpeed );

		playFrame( frames, setImgSrc, tickSpeed );
	}, [ events, tickSpeed ] );

	return (
		<img src={ imgSrc } />
	);
}