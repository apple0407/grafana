import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import { updateLocation } from 'app/core/actions';
import { StoreState } from 'app/types';
import { ExploreUrlState } from 'app/types/explore';

import Explore, { ExploreState } from './Explore';
import { DEFAULT_RANGE } from './TimePicker';

export function parseUrlState(initial: string | undefined): ExploreUrlState {
  if (initial) {
    try {
      return JSON.parse(decodeURI(initial));
    } catch (e) {
      console.error(e);
    }
  }
  return { datasource: null, queries: [], range: DEFAULT_RANGE };
}

export function serializeStateToUrlParam(state: ExploreState): string {
  const urlState: ExploreUrlState = {
    datasource: state.datasourceName,
    queries: state.queries.map(q => ({ query: q.query })),
    range: state.range,
  };
  return JSON.stringify(urlState);
}

interface WrapperProps {
  backendSrv?: any;
  datasourceSrv?: any;
  updateLocation: typeof updateLocation;
  urlStates: { [key: string]: string };
}

interface WrapperState {
  split: boolean;
  splitState: ExploreState;
}

const STATE_KEY_LEFT = 'state';
const STATE_KEY_RIGHT = 'stateRight';

export class Wrapper extends Component<WrapperProps, WrapperState> {
  urlStates: { [key: string]: string };

  constructor(props: WrapperProps) {
    super(props);
    this.urlStates = props.urlStates;
    this.state = {
      split: Boolean(props.urlStates[STATE_KEY_RIGHT]),
      splitState: undefined,
    };
  }

  onChangeSplit = (split: boolean, splitState: ExploreState) => {
    this.setState({ split, splitState });
  };

  onSaveState = (key: string, state: ExploreState) => {
    const urlState = serializeStateToUrlParam(state);
    this.urlStates[key] = urlState;
    this.props.updateLocation({
      query: this.urlStates,
    });
  };

  render() {
    const { datasourceSrv } = this.props;
    // State overrides for props from first Explore
    const { split, splitState } = this.state;
    const urlStateLeft = parseUrlState(this.urlStates[STATE_KEY_LEFT]);
    const urlStateRight = parseUrlState(this.urlStates[STATE_KEY_RIGHT]);
    return (
      <div className="explore-wrapper">
        <Explore
          datasourceSrv={datasourceSrv}
          onChangeSplit={this.onChangeSplit}
          onSaveState={this.onSaveState}
          position="left"
          split={split}
          stateKey={STATE_KEY_LEFT}
          urlState={urlStateLeft}
        />
        {split && (
          <Explore
            datasourceSrv={datasourceSrv}
            onChangeSplit={this.onChangeSplit}
            onSaveState={this.onSaveState}
            position="right"
            split={split}
            splitState={splitState}
            stateKey={STATE_KEY_RIGHT}
            urlState={urlStateRight}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  urlStates: state.location.query,
});

const mapDispatchToProps = {
  updateLocation,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(Wrapper));
