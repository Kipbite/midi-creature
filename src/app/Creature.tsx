"use client"

import { useEffect, useState } from "react";
import { findNoteRange, getAnimationFrames, getBpmFromPpq, getNoteSegment, getNoteSegmentBorders, getTickSpeedFromBpm, MidiEvent, MidiEventWithSegment, playFrame } from './lib';

interface Props {
	events: MidiEvent[]
	ppq: number
	ticksPerBeat: number
}

export default function Creature( {
	events,
	ppq,
	ticksPerBeat
}: Props ) {
	const [ bpm, setBpm ] = useState( getBpmFromPpq( ppq ) );
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

		
		const tickSpeed = getTickSpeedFromBpm( bpm, ticksPerBeat );
		
		console.log( 'tickSpeed: ', tickSpeed );
		playFrame( frames, setImgSrc, tickSpeed );
	}, [ bpm, events, ticksPerBeat ] );

	return (
		<img src={ imgSrc } />
	);
}