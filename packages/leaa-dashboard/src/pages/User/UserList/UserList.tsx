import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Table, Button, message } from 'antd';

import { DEFAULT_PAGE_SIZE_OPTIONS } from '@leaa/dashboard/constants';
import { GET_USERS } from '@leaa/common/graphqls';
import { DELETE_USER } from '@leaa/common/graphqls/user.mutation';
import { User } from '@leaa/common/entrys';
import { IOrderSort } from '@leaa/common/dtos/_common';
import { UsersObject, UsersArgs } from '@leaa/common/dtos/user';
import { urlUtil, tableUtil } from '@leaa/dashboard/utils';
import { IPage } from '@leaa/dashboard/interfaces';
import { PageCard } from '@leaa/dashboard/components/PageCard';
import { ErrorCard } from '@leaa/dashboard/components/ErrorCard';
import { SearchInput } from '@leaa/dashboard/components/SearchInput';
import { TableCard } from '@leaa/dashboard/components/TableCard';
import { TableColumnId } from '@leaa/dashboard/components/TableColumnId';
import { TableColumnDate } from '@leaa/dashboard/components/TableColumnDate';
import { TableColumnDeleteButton } from '@leaa/dashboard/components/TableColumnDeleteButton';

import style from './style.less';

export default (props: IPage) => {
  const { t } = useTranslation();

  const urlParams = queryString.parse(window.location.search);
  const urlPagination = urlUtil.getPagination(urlParams);

  const [q, setQ] = useState<string | undefined>(urlParams && urlParams.q ? `${urlParams.q}` : undefined);
  const [page, setPage] = useState<number | undefined>(urlPagination.page);
  const [pageSize, setPageSize] = useState<number | undefined>(urlPagination.pageSize);
  const [orderBy, setOrderBy] = useState<string | undefined>(urlParams && urlParams.orderBy ? `${urlParams.orderBy}` : undefined); // prettier-ignore
  const [orderSort, setOrderSort] = useState<IOrderSort | string | undefined>(urlParams && urlParams.orderSort ? urlUtil.formatOrderSort(`${urlParams.orderSort}`) : undefined); // prettier-ignore
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[] | string[]>([]);

  const resetUrlParams = () => {
    setPage(urlPagination.page);
    setPageSize(urlPagination.pageSize);
    setOrderBy(undefined);
    setOrderSort(undefined);
    setQ(undefined);
  };

  useEffect(() => {
    if (_.isEmpty(urlParams)) {
      resetUrlParams();
    }
  }, [urlParams]);

  const getUsersVariables = { page, pageSize, q, orderBy, orderSort };
  const getUsersQuery = useQuery<{ users: UsersObject }, UsersArgs>(GET_USERS, {
    variables: getUsersVariables,
  });

  if (getUsersQuery.error) {
    return <ErrorCard message={getUsersQuery.error.message} />;
  }

  const [deleteUserMutate, { loading: deleteItemLoading }] = useMutation<User>(DELETE_USER, {
    onError(e) {
      message.error(e.message);
    },
    onCompleted() {
      message.success(t('_lang:deletedSuccessfully'));
    },
    refetchQueries: () => [{ query: GET_USERS, variables: getUsersVariables }],
  });

  const rowSelection = {
    columnWidth: 30,
    onChange: (keys: number[] | string[]) => {
      setSelectedRowKeys(keys);
    },
    selectedRowKeys,
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 50,
      render: (text: string) => <TableColumnId id={text} />,
    },
    {
      title: t('_lang:email'),
      width: 300,
      dataIndex: 'email',
      sorter: true,
      sortOrder: tableUtil.calcDefaultSortOrder(orderSort, orderBy, 'email'),
      render: (text: string, record: User) => <Link to={`${props.route.path}/${record.id}`}>{record.email}</Link>,
    },
    {
      title: t('_lang:name'),
      dataIndex: 'name',
      sorter: true,
      sortOrder: tableUtil.calcDefaultSortOrder(orderSort, orderBy, 'name'),
    },
    {
      title: t('_lang:createdAt'),
      dataIndex: 'created_at',
      sorter: true,
      sortOrder: tableUtil.calcDefaultSortOrder(orderSort, orderBy, 'created_at'),
      render: (text: string) => <TableColumnDate date={text} size="small" />,
    },
    {
      title: t('_lang:action'),
      dataIndex: 'operation',
      width: 50,
      render: (text: string, record: User) => (
        <TableColumnDeleteButton
          id={record.id}
          loading={deleteItemLoading}
          onClick={async () => deleteUserMutate({ variables: { id: Number(record.id) } })}
        />
      ),
    },
  ];

  return (
    <PageCard
      title={t(`${props.route.namei18n}`)}
      extra={
        <SearchInput
          value={q}
          onChange={(keyword: string) => {
            setPage(1);
            setQ(keyword);

            urlUtil.mergeParamToUrlQuery({
              window,
              params: {
                page: 1,
                q: keyword,
              },
              replace: true,
            });
          }}
        />
      }
      className={style['page-wapper']}
      loading={getUsersQuery.loading}
    >
      {getUsersQuery.data && getUsersQuery.data.users && getUsersQuery.data.users.items && (
        <TableCard
          selectedRowKeys={selectedRowKeys}
          selectedRowBar={
            <Button type="danger" size="small" icon="delete">
              {t('_lang:delete')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            size="small"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={getUsersQuery.data.users.items}
            pagination={{
              defaultCurrent: page,
              defaultPageSize: pageSize,
              total: getUsersQuery.data.users.total,
              current: page,
              pageSize,
              //
              pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
            }}
            onChange={(pagination, filters, sorter) => {
              setPage(pagination.current);
              setPageSize(pagination.pageSize);
              setOrderBy(sorter.field);
              setOrderSort(urlUtil.formatOrderSort(sorter.order));
              setSelectedRowKeys([]);

              urlUtil.mergeParamToUrlQuery({
                window,
                params: {
                  ...urlUtil.pickPagination(pagination),
                  ...urlUtil.pickOrder(sorter),
                },
                replace: true,
              });
            }}
          />
        </TableCard>
      )}
    </PageCard>
  );
};