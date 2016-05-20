var Epicenter = function(_magnitude, _decay, _wavelength, _position){
    this.magnitude = _magnitude;
    this.decay = _decay;
    this.wavelength = _wavelength;
    this.position = _position;
    this.startTime = STEP.getElapsedTime();
};
