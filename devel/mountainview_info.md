# MountainView info

Goal: port mountainview functionality to labbox-ephys

## To install mountainview

```
conda install -c flatiron qt-mountainview
```

## To run mountainview

Download some test data

```
kachery-load-dir sha1dir://fb52d510d2543634e247e0d2d1d4390be9ed9e20.synth_magland/datasets_noise10_K10_C4/001_synth --fr default_readonly --dest 001_synth
```

Then launch qt-mountainview

```
qt-mountainview --raw=001_synth/raw.mda --firings=001_synth/firings_true.mda --samplerate=30000
```

## First thing to reproduce: cluster detail view

We can call it the "unit detail view"

![screenshot](https://drive.google.com/uc?export=download&id=1G6HE4S_-x98lGpS3XCqeej6Lz41gZOP0)

One panel per unit showing unit ID, average waveform (aka template), average firing rate, and number of spikes.

User can select one or more units for highlighting.