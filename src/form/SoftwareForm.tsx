import * as React from 'react';
import { Option } from 'react-select';
import { AddableReactSelect } from './components/AddableReactSelect';

import { StringArray } from './components/StringArray';
import { TextInput } from './components/TextInput';

import 'react-select/dist/react-select.css';

import { connect, Dispatch } from 'react-redux';
import { Action } from 'redux';
import { addToSchemaEnum } from './actions';

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  addToSchemaEnum: (resourceType: string, field: string, value: string) =>
    dispatch(addToSchemaEnum(resourceType, field, value))
});

const mapStateToProps = (state: any) => ({
    schema: state.schema
});

interface IProps {
    schema: any;
    addToSchemaEnum: any;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

class SoftwareFormComponent extends React.Component<IProps, any> {
  componentWillMount() {
    this.setState({id: '', programmingLanguage: []});
  }

  updateFormValue = (field: string) => (value: any) => {
    this.setState({...this.state, [field]: value});
  }

  updateFormOptionsValue = (field: string) => (options: Option[]) => {
    this.updateFormValue(field)(options.map((val) => val.value));
  }

  onNewOption = (resourceType: string, field: string) => (option: Option) => {
    this.props.addToSchemaEnum(resourceType, field, option.value);
  }

  onInputChange(field: string): React.FormEventHandler<React.Component<any>> {
    return (e: React.ChangeEvent<any>) => {
      this.updateFormValue(field)(e.target.value);
    };
  }

  schemaEnum(type: string, fieldName: string): string[] {
    const field = this.props.schema[type].properties[fieldName];

    return (field.type === 'array') ? (field.items.enum || []) : (field.enum || []);
  }

  renderField = (key: string, field: any): any => {
    if (field.type === 'string') {
      return (<TextInput value={this.state[key]} label={field.description} onChange={this.updateFormValue(key)} />);
    } else if (field.type === 'array' && 'items' in field && field.items.enum) {
      return (
        <AddableReactSelect
          label={field.description}
          options={this.schemaEnum('software', key).map((option) => ({ label: option, value: option}))}
          multi={true}
          value={(this.state[key] || []).map((val: string) => ({value: val, label: val}))}
          onChange={this.updateFormOptionsValue(key)}
          onNewOption={this.onNewOption('software', key)}
        />
      );
    } else if (field.type === 'array' && (!('items' in field) || !('enum' in field.items))) {
      return (
        <StringArray
          label={field.description}
          value={(this.state[key] || [])}
          onChange={this.updateFormValue(key)}
        />
      );
    } else {
      return (<div>{key} {JSON.stringify(field)}</div>);
    }
  }

  renderFields = (schema: any) =>
    Object.keys(schema.properties).map((key: string) => this.renderField(key, schema.properties[key]))

  render() {
    return (
      <div style={{maxWidth: '400px', margin: '0 auto'}}>
        {this.renderFields(this.props.schema.software)}
      </div>
    );
  }
}

export const SoftwareForm = connector(SoftwareFormComponent);
