import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './_index.scss';
import Service from '../../services/Service';
import SkeletonLoader from '../SkeletonLoader';

function DetailedView({ data, xAxisAttr, categoryToFilterBy, yAxisAttr}) {
	const [image, setImage] = useState('');
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		const soundData = data.file_data.split(',').map(Number);
		const sampleRate = Number(data.sample_rate);
		Service.generateSpectrogram({ sound_data: soundData, sample_rate: sampleRate }).then(res => {
			setImage(res);
			setLoading(false);
		});
	}, [data]);

  return isLoading ? <SkeletonLoader /> : (
    <div className="sm-DetailedView">
			<img src={image} className="sm-DetailedView-spectrogram" />
			<div className="sm-DetailedView-metadata">
				<h6>Details</h6>
				<hr />
				<div><strong>{yAxisAttr}:</strong> {data[yAxisAttr]}</div>
				<div><strong>{xAxisAttr}:</strong> {parseFloat(data[xAxisAttr]).toFixed(2)}</div>
				<div><strong>{categoryToFilterBy}:</strong> {data[categoryToFilterBy]}</div>
			</div>
    </div>
  );
}


DetailedView.propTypes = {
	xAxisAttr: PropTypes.string,
	yAxisAttr: PropTypes.string,
	categoryToFilterBy: PropTypes.string,
	data: PropTypes.object,
}

export default DetailedView;
