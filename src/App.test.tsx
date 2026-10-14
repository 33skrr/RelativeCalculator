import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

function setup() {
  render(<App />);
  const user = userEvent.setup();
  const click = async (...labels: string[]) => {
    for (const name of labels) await user.click(screen.getByRole('button', { name }));
  };
  return { click };
}

describe('亲戚计算器', () => {
  it('性别按钮联动原生禁用态，输入不改变顶部规则', async () => {
    const { click } = setup();
    expect(screen.getByRole('button', { name: '男生' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '老婆' })).toBeDisabled();
    await click('妈妈');
    expect(screen.getByRole('button', { name: '老婆' })).toBeDisabled();
    await click('女生');
    expect(screen.getByRole('button', { name: '老公' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '老婆' })).toBeEnabled();
    expect(screen.getByLabelText('关系链')).toHaveTextContent('妈妈');
  });
  it('按等号才计算，反向和更改性别立即重算但保留原链', async () => {
    const { click } = setup();
    await click('爸爸', '哥哥');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await click('计算');
    expect(screen.getByRole('status')).toHaveTextContent('伯父');
    await click('切换');
    expect(screen.getByText('对方称呼我')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('侄子');
    await click('女生');
    expect(screen.getByRole('status')).toHaveTextContent('侄女');
    expect(screen.getByLabelText('关系链')).toHaveTextContent(/^爸爸的哥哥$/);
    await click('切换');
    expect(screen.getByRole('status')).toHaveTextContent('伯父');
  });
  it('编辑清除旧答案，重置保留性别恢复正向，空链为自己', async () => {
    const { click } = setup();
    await click('女生', '爸爸', '哥哥', '计算', '回退');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByLabelText('关系链')).toHaveTextContent('爸爸');
    await click('计算', '儿子');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await click('切换', '重置');
    expect(screen.getByText('我称呼对方')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '女生' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '回退' })).toBeDisabled();
    await click('计算');
    expect(screen.getByRole('status')).toHaveTextContent('自己');
  });
  it('保留长幼候选并对无效关系给出提示', async () => {
    const { click } = setup();
    await click('妈妈', '姐姐', '女儿', '计算');
    expect(screen.getByRole('status')).toHaveTextContent('表姐 / 表妹');
    await click('重置', '爸爸', '老公', '计算');
    expect(screen.getByRole('status')).toHaveTextContent('暂未找到对应称呼，请检查关系');
  });
});
