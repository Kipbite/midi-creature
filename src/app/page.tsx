'use client'

import midiFileParser from 'midi-file-parser';
import Creature from './Creature';
import { useState } from 'react';
import { findSetTempoEvent, MidiNoteEvent, MidiSetTempoEvent, readFileFromUrl } from './lib';
import FileUpload from './FileUpload';
import ColorPicker from '@rc-component/color-picker';
import '@rc-component/color-picker/assets/index.css';


export default function Home() {
	const [ file, setFile ] = useState<File>();
	const [ ppq, setPpq ] = useState<number>();
	const [ ticksPerBeat, setTicksPerBeat ] = useState<number>();
	const [ events, setEvents ] = useState<MidiNoteEvent[]>();
	const [ backgroundColor, setBackgroundColor ] = useState( '#8e8282' );
	const [ showPicker, setShowPicker ] = useState( false );

	if ( ! file ) {
		function handleUpload( formData: FormData ) {
			const midiFile = formData.get( 'midi-file' ) as File;
			setFile( midiFile );
		}

		async function handlePreset( url: string ) {
			const fileData = await readFileFromUrl( url );
			if ( ! fileData ) {
				return;
			}
			setFile( fileData );
		}

		return (
			<>
				<FileUpload handleUpload={ handleUpload } />
			</>
		);
	}

	if ( ! ppq || ! ticksPerBeat || ! events ) {
		file.arrayBuffer().then( arrayBuffer => {
			const buffer = Buffer.from( arrayBuffer );
			const string = buffer.toString( 'binary' );
			const midi = midiFileParser( string );

			let setTempoEvent: MidiSetTempoEvent | null = null;
			for ( const track of midi.tracks ) {
				const found = findSetTempoEvent( track );
				if ( found ) {
					setTempoEvent = found;
				}
			}

			if ( ! setTempoEvent ) {
				console.error( 'Could not find setTempo event' );
				return;
			}

			const ppq = setTempoEvent.microsecondsPerBeat;
			const { ticksPerBeat } = midi.header;
	
			setPpq( ppq );
			setTicksPerBeat( ticksPerBeat );
			setEvents( midi.tracks[1] );
		} );

		return 'Loading...';
	}

	return (
		<div style={{
			width: '100vw',
			height: '100vh',
			background: backgroundColor
		}}>
			<Creature
				events={ events }
				ppq={ ppq }
				ticksPerBeat={ ticksPerBeat }
			/>

			<button onClick={() => setShowPicker( ! showPicker )}>
				{ showPicker ? 'Hide' : 'Show' } BG Colour Picker
			</button>
			{ showPicker &&
				<div style={{ display: 'flex' }}>
					<ColorPicker
						value={ backgroundColor }
						onChange={ color => setBackgroundColor( color.toHexString() ) }
					/>
				</div>
			}
		</div>
	);
}
