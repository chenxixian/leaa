import React from 'react';
import cx from 'classnames';
import { Col, Form, Input, Row, Descriptions, Card } from 'antd';
import { withTranslation } from 'react-i18next';
import { FormComponentProps } from 'antd/lib/form';

import { Article } from '@leaa/common/entrys';
import { ITfn } from '@leaa/dashboard/interfaces';
import { SwitchNumber } from '@leaa/dashboard/components/SwitchNumber';

import style from './style.less';

interface IFormProps extends FormComponentProps {
  className?: string;
  item?: Article;
  loading?: boolean;
}

type IProps = IFormProps & ITfn;

class ArticleInfoFormInner extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { t } = this.props;

    const { props } = this;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className={cx(style['wrapper'], props.className)}>
        <Form className={style['form-wrapper']}>
          <Card>
            <Descriptions title={t('_page:Article.Component.articleInfo')} />

            <Row gutter={16} className={style['form-row']}>
              <Col xs={24} sm={14}>
                <Form.Item label={t('_lang:title')}>
                  {getFieldDecorator('title', {
                    initialValue: props.item ? props.item.title : undefined,
                    rules: [{ required: true }],
                  })(<Input placeholder={t('_lang:title')} />)}
                </Form.Item>
              </Col>

              <Col xs={24} sm={6}>
                <Form.Item label={t('_lang:category')}>
                  {getFieldDecorator('categoryId', {
                    initialValue: props.item ? props.item.categoryId : undefined,
                    rules: [{ required: true }],
                    normalize: e => Number(e),
                  })(<Input type="number" placeholder={t('_lang:category')} />)}
                </Form.Item>
              </Col>

              <Col xs={24} sm={4}>
                <Form.Item label={t('_lang:status')}>
                  {getFieldDecorator('status', {
                    initialValue: props.item ? Number(props.item.status) : 0,
                    getValueFromEvent: (v: boolean) => Number(v),
                  })(<SwitchNumber />)}
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    );
  }
}

// @ts-ignore
export const ArticleInfoForm = withTranslation()(Form.create<IFormProps>()(ArticleInfoFormInner));