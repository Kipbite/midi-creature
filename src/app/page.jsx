import midiFileParser from 'midi-file-parser';
import fs from 'fs';
import Creature from './Creature';

export default function Home() {
	const file = fs.readFileSync( './public/test.mid', 'binary' );
	const midi = midiFileParser( file );

	// One tick is 4310.34375 microseconds, or 4.31034375 milliseconds

	// If the MIDI time division is 60 ticks per beat and if the microseconds per beat is 500,000, then 1 tick = 500,000 / 60 = 8333.33 microseconds


	// ms per tick = 413793 / 96
	// microseconds per tick = microseconds per quarter note / ticks per quarter note

	// PPQ === ticksPerBeat

	const ticks_per_quarter = midi.header.ticksPerBeat;
	const µs_per_quarter = midi.tracks[0][0].microsecondsPerBeat;
	const µs_per_tick = µs_per_quarter / ticks_per_quarter
	const seconds_per_tick = µs_per_tick / 1000000
	const ms_per_tick = seconds_per_tick * 1000;


	const bpm = 60000000 / µs_per_quarter;

	const reverse = 145 * µs_per_quarter;
	console.log( 'reverse: ', reverse );

	console.log( 'bpm: ', bpm );


	return (
		<Creature events={ midi.tracks[1] } tickSpeed={ ms_per_tick } />
	);
}
