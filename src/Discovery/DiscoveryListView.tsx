import React from 'react';
import { Table } from 'antd';
import './Discovery.css';
import { DiscoveryConfig } from './DiscoveryConfig';

export enum AccessLevel {
  BOTH = 'both',
  ACCESSIBLE = 'accessible',
  UNACCESSIBLE = 'unaccessible',
}

interface Props {
  config: DiscoveryConfig;
  studies: {__accessible: boolean, [any: string]: any}[];
  columns: [];
  visibleResources: [];
  accessibleFieldName: string;
  searchTerm: string;
  setPermalinkCopied: (boolean) => void;
  setModalVisible: (boolean) => void;
  setModalData: (boolean) => void;
  selectedResources: [];
  setSelectedResources: (any) => void;
}

export const DiscoveryListView: React.FunctionComponent<Props> = (props: Props) => {
  const searchTerm = props.searchTerm;

  return (
    <Table
      loading={props.studies.length === 0}
      width={'500px'}
      columns={props.columns}
      rowKey={props.config.minimalFieldMapping.uid}
      rowSelection={(
        props.config.features.exportToWorkspace
              && props.config.features.exportToWorkspace.enabled
      ) && {
        selectedRowKeys: props.selectedResources.map(
          (r) => r[props.config.minimalFieldMapping.uid],
        ),
        preserveSelectedRowKeys: true,
        onChange: (_, selectedRows) => {
          props.setSelectedResources(selectedRows);
        },
        getCheckboxProps: (record) => {
          let disabled;
          // if auth is enabled, disable checkbox if user doesn't have access
          if (props.config.features.authorization.enabled) {
            disabled = record[props.accessibleFieldName] !== AccessLevel.ACCESSIBLE;
          }
          // disable checkbox if there's no manifest found for this study
          const exportToWorkspaceConfig = props.config.features.exportToWorkspace;
          const { manifestFieldName } = exportToWorkspaceConfig;
          if (!record[manifestFieldName] || record[manifestFieldName].length === 0) {
            disabled = true;
          }
          return { disabled };
        },
      }}
      rowClassName='discovery-table__row'
      onRow={(record) => ({
        onClick: () => {
          props.setPermalinkCopied(false);
          props.setModalVisible(true);
          props.setModalData(record);
        },
        onKeyPress: () => {
          props.setPermalinkCopied(false);
          props.setModalVisible(true);
          props.setModalData(record);
        },
      })}
      dataSource={props.visibleResources}
      expandable={props.config.studyPreviewField && ({
        // expand all rows
        expandedRowKeys: props.visibleResources.map(
          (r) => r[props.config.minimalFieldMapping.uid]),
        expandedRowRender: (record) => {
          const studyPreviewText = record[props.config.studyPreviewField.field];
          const renderValue = (value: string | undefined): React.ReactNode => {
            if (!value) {
              if (props.config.studyPreviewField.includeIfNotAvailable) {
                return props.config.studyPreviewField.valueIfNotAvailable;
              }
            }

            if (searchTerm) {
              // get index of this.props.searchTerm match
              const matchIndex = value.toLowerCase().indexOf(
                props.searchTerm.toLowerCase());
              if (matchIndex === -1) {
                // if searchterm doesn't match this record, don't highlight anything
                return value;
              }
              // Scroll the text to the search term and highlight the search term.
              let start = matchIndex - 100;
              if (start < 0) {
                start = 0;
              }
              return (
                <React.Fragment>
                  { start > 0 && '...' }
                  {value.slice(start, matchIndex)}
                  <span className='matched'>{value.slice(matchIndex,
                    matchIndex + props.searchTerm.length)}
                  </span>
                  {value.slice(matchIndex + props.searchTerm.length)}
                </React.Fragment>
              );
            }
            return value;
          };
          return (
            <div
              className='discovery-table__expanded-row-content'
              role='button'
              tabIndex={0}
              onClick={() => {
                props.setPermalinkCopied(false);
                props.setModalData(record);
                props.setModalVisible(true);
              }}
              onKeyPress={() => {
                props.setPermalinkCopied(false);
                props.setModalData(record);
                props.setModalVisible(true);
              }}
            >
              {renderValue(studyPreviewText)}
            </div>
          );
        },
        expandedRowClassName: () => 'discovery-table__expanded-row',
        expandIconColumnIndex: -1, // don't render expand icon
      })}
    />
  );
};
