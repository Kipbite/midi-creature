/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react";
import { findNoteRange, getAnimationFrames, getBpmFromPpq, getNoteSegment, getSegmentBorders, getTickSpeedFromBpm, MidiEventWithSegment, MidiNoteEvent, playFrame } from './lib';

interface Props {
	events: MidiNoteEvent[]
	ppq: number
	ticksPerBeat: number
}

export default function Creature( { events, ppq, ticksPerBeat }: Props ) {
	const [ imgSrc, setImgSrc ] = useState( '#' );

	useEffect( () => {
		const bpm = getBpmFromPpq( ppq );
		const noteRange = findNoteRange( events, 'noteNumber' );

		if ( ! noteRange ) {
			console.error( 'Could not find note range' );
			return;
		}

		const velocityRange = findNoteRange( events, 'velocity' );

		if ( ! velocityRange ) {
			console.error( 'Could not find velocity range' );
			return;
		}

		const noteSegmentsBorders = getSegmentBorders( noteRange );
		const velocitySegmentBorders = getSegmentBorders( velocityRange );

		const notes: MidiEventWithSegment[] = [];

		try {
			events.forEach( event => {
				if ( event.noteNumber ) {
					const noteSegment = getNoteSegment( event.noteNumber, noteSegmentsBorders );
					const velocitySegment = getNoteSegment( event.velocity, velocitySegmentBorders );

					notes.push( {
						...event,
						noteSegment,
						velocitySegment
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
		<img src={ imgSrc } style={{ maxWidth: '100%' }} alt="Creature singing" />
	);
}