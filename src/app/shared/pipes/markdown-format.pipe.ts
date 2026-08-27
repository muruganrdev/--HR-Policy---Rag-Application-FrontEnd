import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdownFormat',
  standalone: true
})
export class MarkdownFormatPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';

    let formatted = value;

    // Sanitize HTML basic characters
    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');

    // Bullet points (* or -)
    formatted = formatted.replace(/^[\*\-]\s+(.*)$/gm, '<li class="chat-bullet">$1</li>');

    // Code blocks `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');

    // Wrap consecutive <li> into <ul>
    formatted = formatted.replace(/(<li class="chat-bullet">.*?<\/li><br\/>?)+/g, (match) => {
      const cleaned = match.replace(/<br\/>/g, '');
      return `<ul class="chat-list">${cleaned}</ul>`;
    });

    return formatted;
  }
}
