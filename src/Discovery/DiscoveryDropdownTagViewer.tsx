import React from 'react';
import _ from 'lodash';
import {
  Select, Row, Col, Tag,
} from 'antd';
import { DiscoveryConfig } from './DiscoveryConfig';
import { DiscoveryResource } from './Discovery';
import Tooltip from 'rc-tooltip';
import { InfoCircleOutlined } from '@ant-design/icons'

const { Option } = Select;
//const tooltipText = ' test info';

interface DiscoveryTagViewerProps {
  config: DiscoveryConfig
  studies?: DiscoveryResource[]
  selectedTags: any
  setSelectedTags: any
}

const DiscoveryDropdownTagViewer: React.FunctionComponent<DiscoveryTagViewerProps> = (props: DiscoveryTagViewerProps) => {
  // getTagsInCategory returns a list of the unique tags in studies which belong
  // to the specified category.
  const getTagsInCategory = (category: any, displayName: string, studies: any[] | null):React.ReactNode => {
    if (!studies) {
      return <React.Fragment />;
    }
    const tagMap = {};
    studies.forEach((study) => {
      const tagField = props.config.minimalFieldMapping.tagsListFieldName;
      study[tagField]?.forEach((tag) => {
        if (tag.category === category.name) {
          tagMap[tag.name] = 1;
        }
      });
    });
    const tagArray = Object.keys(tagMap).sort((a, b) => a.localeCompare(b));
    // get selected tags which value is not 'undefined'
    const trulySelectedTags = Object.keys(props.selectedTags).reduce((acc, el) => {
      if (props.selectedTags[el] !== undefined) acc.push(el);
      return acc;
    }, []);
    const valueArray = _.intersection(tagArray, trulySelectedTags);

    return (
      <Select
        mode='multiple'
        showSearch
        showArrow
        allowClear
        maxTagCount={3}
        style={{ width: '100%' }}
        id={`discovery-tag-column--${category.name}`}
        placeholder={displayName}
        value={valueArray}
        onSelect={(tag: string) => {
          props.setSelectedTags({
            ...props.selectedTags,
            [tag]: props.selectedTags[tag] ? undefined : true,
          });
        }}
        onDeselect={(tag: string) => {
          props.setSelectedTags({
            ...props.selectedTags,
            [tag]: props.selectedTags[tag] ? undefined : true,
          });
        }}
      >
        { tagArray.map((tag) => (
          <Option
            key={category.name + tag}
            value={tag}
          >
            <Tag
              key={category.name + tag}
              role='button'
              tabIndex={0}
              aria-pressed={props.selectedTags[tag] ? 'true' : 'false'}
              className={`discovery-header__tag-btn discovery-tag ${(props.selectedTags[tag]) ? 'discovery-tag--selected' : ''}`}
              aria-label={tag}
              style={{
                backgroundColor: props.selectedTags[tag] ? category.color : 'initial',
                borderColor: category.color,
              }}
            >
              {tag}
            </Tag>
          </Option>
        ),
        )}
      </Select>
    );
  };

  return (
    <Row
      gutter={[16, 8]}
      justify='space-between'
    >
      {
        props.config.tagCategories.map((category) => {
          if (category.display === false) {
            return null;
          }

          let categoryDisplayName = category.displayName;
          if (!categoryDisplayName) {
            // Capitalize category name
            const categoryWords = category.name.split('_').map((x) => x.toLowerCase());
            categoryWords[0] = categoryWords[0].charAt(0).toUpperCase()
                + categoryWords[0].slice(1);
            categoryDisplayName = categoryWords.join(' ');
          }

          const tags = getTagsInCategory(category, categoryDisplayName, props.studies);

          return (
            <Col
            className='discovery-header__tag-group'
              key={category.name}
              xs={24}
              sm={24}
              md={12}
              lg={12}
              xl={12}
              xxl={12}

            >
              <table>
                <tr>
                  <td>
                  <Col>
                  <div style={{ display: category.tooltip != null ? 'block' : 'none' }}>
                  <Tooltip
                  placement='left'
                  overlay={category.tooltip}
                  overlayClassName='g3-filter-section__and-or-toggle-helper-tooltip'
                 arrowContent={<div className='rc-tooltip-arrow-inner' />}
                  width='100%'
                  trigger={['hover', 'focus']}
                  id={'controlPanelTooltipAdditional_data'}
                >
                   <span
                    role='button'
                    aria-describedby={'controlPanelTooltipAdditional_data'}
                    className={'g3-helper-tooltip'}
                  >
                    <InfoCircleOutlined />
                  </span>
                </Tooltip>
                  </div>
                  </Col>
                  </td>
                  <td width='100%'>
                  {tags}
                  </td>
                </tr>
               </table>
            </Col>
          );
        })
      }
    </Row>
  );
};

DiscoveryDropdownTagViewer.defaultProps = {
  studies: null,
};

export default DiscoveryDropdownTagViewer;
