// @flow strict

import React, { type Element, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import classNames from 'classnames';
import find from 'lodash/find';
import getProp from 'lodash/get';
import isEqual from 'lodash/isEqual';
import MultiGrid from 'react-virtualized/dist/es/MultiGrid/MultiGrid';

import Field from '../metadata-instance-editor/fields/Field';
import FileIcon from '../../icons/file-icon';
import IconWithTooltip from './IconWithTooltip';
import PlainButton from '../../components/plain-button';

import { getFileExtension } from '../../utils/file';
import messages from '../../elements/common/messages';

import './MetadataBasedItemList.scss';

import type { MetadataColumnConfig, MetadataColumnsToShow } from '../../common/types/metadataQueries';
import type { MetadataFieldValue } from '../../common/types/metadata';
import type { StringAnyMap, Collection, BoxItem } from '../../common/types/core';

import {
    CANCEL_ICON_TYPE,
    EDIT_ICON_TYPE,
    FILE_ICON_COLUMN_INDEX,
    FILE_ICON_COLUMN_WIDTH,
    FILE_ICON_SIZE,
    FILE_NAME_COLUMN_INDEX,
    FILE_NAME_COLUMN_WIDTH,
    FIXED_COLUMNS_NUMBER,
    FIXED_ROW_NUMBER,
    HEADER_ROW_INDEX,
    MIN_METADATA_COLUMN_WIDTH,
    SAVE_ICON_TYPE,
} from './constants';

type State = {
    editedColumnIndex: number,
    editedRowIndex: number,
    hoveredColumnIndex: number,
    hoveredRowIndex: number,
    valueBeingEdited: ?MetadataFieldValue,
};

type Props = {
    currentCollection: Collection,
    metadataColumnsToShow: MetadataColumnsToShow,
    onItemClick: BoxItem => void,
    onMetadataUpdate: (BoxItem, string, ?MetadataFieldValue, ?MetadataFieldValue) => void,
};

type CellRendererArgs = {
    columnIndex: number,
    key: string,
    rowIndex: number,
    style: StringAnyMap,
};

type ColumnWidthCallback = ({ index: number }) => number;
type GridCellData = Element<typeof FileIcon | typeof PlainButton | typeof Fragment>;

class MetadataBasedItemList extends React.Component<Props, State> {
    props: Props;

    constructor(props: Props) {
        super(props);

        this.state = this.getInitialState();
    }

    componentDidUpdate(prevProps: Props) {
        const prevItems = getProp(prevProps, 'currentCollection.items');
        const currentItems = getProp(this.props, 'currentCollection.items');

        if (!isEqual(currentItems, prevItems)) {
            // Either the view was refreshed or metadata was updated, reset the state to initial values
            this.setState(this.getInitialState());
        }
    }

    getColumnWidth(width: number): ColumnWidthCallback {
        const { metadataColumnsToShow }: Props = this.props;

        return ({ index }: { index: number }): number => {
            if (index === FILE_ICON_COLUMN_INDEX) {
                return FILE_ICON_COLUMN_WIDTH;
            }

            if (index === FILE_NAME_COLUMN_INDEX) {
                return FILE_NAME_COLUMN_WIDTH;
            }

            const availableWidth = width - FILE_NAME_COLUMN_WIDTH - FILE_ICON_COLUMN_WIDTH; // total width minus width of sticky columns
            // Maintain min column width, else occupy the rest of the space equally
            return Math.max(availableWidth / metadataColumnsToShow.length, MIN_METADATA_COLUMN_WIDTH);
        };
    }

    getInitialState = () => {
        return {
            // initial MultiGrid load
            editedColumnIndex: -1,
            editedRowIndex: -1,
            hoveredRowIndex: -1,
            hoveredColumnIndex: -1,
            valueBeingEdited: null,
        };
    };

    getItemWithPermissions = (item: BoxItem): BoxItem => {
        /*
            - @TODO: Remove permissions object once its part of API response.
            - add "can_preview: true" so that users can click to launch the Preview modal. If users don't have access, they will see the error when Preview loads.
            - add "can_upload: true" so that users can update the metadata values.
        */
        const permissions = {
            can_preview: true,
            can_upload: true,
        };
        return { ...item, permissions };
    };

    getMetadataColumnName(column: MetadataColumnConfig | string): string {
        return typeof column === 'string' ? column : getProp(column, 'name');
    }

    handleItemClick(item: BoxItem): void {
        const { onItemClick }: Props = this.props;
        onItemClick(this.getItemWithPermissions(item));
    }

    handleEditIconClick(columnIndex: number, rowIndex: number, value: string): void {
        this.setState({
            editedColumnIndex: columnIndex,
            editedRowIndex: rowIndex,
            valueBeingEdited: value,
        });
    }

    handleCancelEdit = (): void => {
        this.setState({
            editedColumnIndex: -1,
            editedRowIndex: -1,
        });
    };

    handleSave = (
        item: BoxItem,
        field: string,
        currentValue: ?MetadataFieldValue,
        editedValue: ?MetadataFieldValue,
    ): void => {
        const { onMetadataUpdate } = this.props;
        onMetadataUpdate(this.getItemWithPermissions(item), field, currentValue, editedValue);
    };

    handleMouseEnter = (columnIndex: number, rowIndex: number): void =>
        this.setState({
            hoveredColumnIndex: columnIndex,
            hoveredRowIndex: rowIndex,
        });

    handleMouseLeave = (): void =>
        this.setState({
            hoveredRowIndex: -1,
            hoveredColumnIndex: -1,
        });

    getGridCellData(columnIndex: number, rowIndex: number): GridCellData | void {
        const {
            currentCollection: { items = [] },
            metadataColumnsToShow,
        }: Props = this.props;
        const {
            hoveredColumnIndex,
            hoveredRowIndex,
            editedColumnIndex,
            editedRowIndex,
            valueBeingEdited,
        }: State = this.state;
        const isCellBeingEdited = columnIndex === editedColumnIndex && rowIndex === editedRowIndex;
        const isCellHovered = columnIndex === hoveredColumnIndex && rowIndex === hoveredRowIndex;
        const metadataColumn = metadataColumnsToShow[columnIndex - FIXED_COLUMNS_NUMBER];
        const isCellEditable = !isCellBeingEdited && isCellHovered && !!getProp(metadataColumn, 'canEdit', false);
        const item = items[rowIndex - 1];
        const { id, name } = item;
        const fields = getProp(item, 'metadata.enterprise.fields', []);
        let cellData;

        switch (columnIndex) {
            case FILE_ICON_COLUMN_INDEX:
                cellData = <FileIcon dimension={FILE_ICON_SIZE} extension={getFileExtension(name)} />;
                break;
            case FILE_NAME_COLUMN_INDEX:
                cellData = (
                    <PlainButton type="button" onClick={() => this.handleItemClick(item)}>
                        {name}
                    </PlainButton>
                );
                break;
            default: {
                const mdFieldName = this.getMetadataColumnName(metadataColumn);
                const field = find(fields, ['name', mdFieldName]);
                if (!field) {
                    return cellData;
                }
                const { type, value, options = [] } = field;
                cellData = (
                    <>
                        {!isCellBeingEdited && value}
                        {value && isCellEditable && (
                            <IconWithTooltip
                                type={EDIT_ICON_TYPE}
                                tooltipText={<FormattedMessage {...messages.editLabel} />}
                                onClick={() => this.handleEditIconClick(columnIndex, rowIndex, value)}
                            />
                        )}
                        {isCellBeingEdited && valueBeingEdited && (
                            <div className="bdl-MetadataBasedItemList-cell--edit">
                                <Field
                                    canEdit
                                    dataKey={`${id}${mdFieldName}`}
                                    dataValue={valueBeingEdited}
                                    displayName=""
                                    type={type}
                                    onChange={(key, changedValue) => {
                                        this.setState({
                                            valueBeingEdited: changedValue,
                                        });
                                    }}
                                    onRemove={() => {
                                        /* implement me */
                                    }}
                                    options={options}
                                />
                                <IconWithTooltip
                                    className="bdl-MetadataBasedItemList-cell--cancelIcon"
                                    onClick={this.handleCancelEdit}
                                    tooltipText={<FormattedMessage {...messages.cancel} />}
                                    type={CANCEL_ICON_TYPE}
                                />
                                <IconWithTooltip
                                    className="bdl-MetadataBasedItemList-cell--saveIcon"
                                    onClick={() => this.handleSave(item, mdFieldName, value, valueBeingEdited)}
                                    tooltipText={<FormattedMessage {...messages.save} />}
                                    type={SAVE_ICON_TYPE}
                                />
                            </div>
                        )}
                    </>
                );
            }
        }

        return cellData;
    }

    getGridHeaderData(columnIndex: number): string | Element<typeof FormattedMessage> {
        const { metadataColumnsToShow } = this.props;

        if (columnIndex === FILE_NAME_COLUMN_INDEX) {
            return <FormattedMessage {...messages.name} />; // "Name" column header
        }

        return this.getMetadataColumnName(metadataColumnsToShow[columnIndex - FIXED_COLUMNS_NUMBER]); // column header
    }

    cellRenderer = ({ columnIndex, rowIndex, key, style }: CellRendererArgs): Element<'div'> => {
        const { hoveredRowIndex } = this.state;
        const isHeaderRow = rowIndex === HEADER_ROW_INDEX;
        const isFileIconCell = !isHeaderRow && columnIndex === FILE_ICON_COLUMN_INDEX;
        const isFileNameCell = !isHeaderRow && columnIndex === FILE_NAME_COLUMN_INDEX;
        const isGridRowHovered = !isHeaderRow && rowIndex === hoveredRowIndex;

        const data = isHeaderRow ? this.getGridHeaderData(columnIndex) : this.getGridCellData(columnIndex, rowIndex);

        const classes = classNames('bdl-MetadataBasedItemList-cell', {
            'bdl-MetadataBasedItemList-cell--fileIcon': isFileIconCell,
            'bdl-MetadataBasedItemList-cell--filename': isFileNameCell,
            'bdl-MetadataBasedItemList-cell--hover': isGridRowHovered,
        });

        return (
            <div
                key={key}
                className={classes}
                style={style}
                onMouseLeave={this.handleMouseLeave}
                onMouseEnter={() => this.handleMouseEnter(columnIndex, rowIndex)}
            >
                {data}
            </div>
        );
    };

    render() {
        const { currentCollection, metadataColumnsToShow }: Props = this.props;
        const rowCount = currentCollection.items ? currentCollection.items.length : 0;

        return (
            <AutoSizer>
                {({ width, height }) => (
                    <div className="bdl-MetadataBasedItemList">
                        <MultiGrid
                            cellRenderer={this.cellRenderer}
                            columnCount={metadataColumnsToShow.length + FIXED_COLUMNS_NUMBER}
                            columnWidth={this.getColumnWidth(width)}
                            fixedColumnCount={FIXED_COLUMNS_NUMBER}
                            fixedRowCount={FIXED_ROW_NUMBER}
                            height={height}
                            hideBottomLeftGridScrollbar
                            hideTopRightGridScrollbar
                            rowCount={rowCount + FIXED_ROW_NUMBER}
                            rowHeight={50}
                            width={width}
                        />
                    </div>
                )}
            </AutoSizer>
        );
    }
}

export default MetadataBasedItemList;
