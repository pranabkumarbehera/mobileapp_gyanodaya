import React, { memo, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Clipboard,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { normalize, verticalScale } from '../Utils/Helpers/normalize';
import { useTheme } from '../Themes/hooks';

// --- Types ---
type TipTapNode = {
    type: string;
    text?: string;
    content?: TipTapNode[];
    attrs?: Record<string, any>;
    marks?: { type: string; attrs?: Record<string, any> }[];
};

type CustomNoteRendererProps = {
    content?: string | TipTapNode | Record<string, any> | null;
    htmlFallback?: string | null;
};

// --- Greek & Math Symbols Dictionary ---
const GREEK_MATH_SYMBOLS: Record<string, string> = {
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\omicron': 'ο',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    '\\Delta': 'Δ',
    '\\Gamma': 'Γ',
    '\\Theta': 'Θ',
    '\\Lambda': 'Λ',
    '\\Xi': 'Ξ',
    '\\Pi': 'Π',
    '\\Sigma': 'Σ',
    '\\Phi': 'Φ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω',
    '\\pm': '±',
    '\\times': '×',
    '\\div': '÷',
    '\\neq': '≠',
    '\\le': '≤',
    '\\ge': '≥',
    '\\infty': '∞',
    '\\approx': '≈',
    '\\cdot': '·',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\sum': '∑',
    '\\int': '∫',
    '\\rightarrow': '→',
    '\\in': '∈',
    '\\notin': '∉',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\cup': '∪',
    '\\cap': '∩',
    '\\subset': '⊂',
    '\\subseteq': '⊆',
    '\\sup': 'sup',
    '\\inf': 'inf',
    '\\deg': '°',
};

// --- Braces matching helper ---
function matchBraces(str: string, startIndex: number): number {
    let depth = 0;
    for (let i = startIndex; i < str.length; i++) {
        if (str[i] === '{') depth++;
        else if (str[i] === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// --- Math AST Node Type ---
type MathNode =
    | { type: 'text'; value: string }
    | { type: 'fraction'; num: MathNode[]; den: MathNode[] }
    | { type: 'superscript'; value: MathNode[] }
    | { type: 'subscript'; value: MathNode[] }
    | { type: 'sqrt'; value: MathNode[] };

// --- Pure JS LaTeX Math Parser ---
function parseLatex(str: string): MathNode[] {
    const result: MathNode[] = [];
    let i = 0;

    // Normalize backslash spaces
    str = str.replace(/\\ /g, ' ');

    while (i < str.length) {
        // 1. Fraction: \frac{num}{den}
        if (str.startsWith('\\frac', i)) {
            let firstOpen = str.indexOf('{', i);
            if (firstOpen !== -1) {
                let firstClose = matchBraces(str, firstOpen);
                if (firstClose !== -1) {
                    let secondOpen = str.indexOf('{', firstClose);
                    if (secondOpen !== -1 && str.substring(firstClose + 1, secondOpen).trim() === '') {
                        let secondClose = matchBraces(str, secondOpen);
                        if (secondClose !== -1) {
                            const numStr = str.substring(firstOpen + 1, firstClose);
                            const denStr = str.substring(secondOpen + 1, secondClose);
                            result.push({
                                type: 'fraction',
                                num: parseLatex(numStr),
                                den: parseLatex(denStr),
                            });
                            i = secondClose + 1;
                            continue;
                        }
                    }
                }
            }
        }

        // 2. Square Root: \sqrt{content}
        if (str.startsWith('\\sqrt', i)) {
            let open = str.indexOf('{', i);
            if (open !== -1) {
                let close = matchBraces(str, open);
                if (close !== -1) {
                    const contentStr = str.substring(open + 1, close);
                    result.push({
                        type: 'sqrt',
                        value: parseLatex(contentStr),
                    });
                    i = close + 1;
                    continue;
                }
            }
        }

        // 3. Superscript: ^
        if (str[i] === '^') {
            if (str[i + 1] === '{') {
                let close = matchBraces(str, i + 1);
                if (close !== -1) {
                    const contentStr = str.substring(i + 2, close);
                    result.push({
                        type: 'superscript',
                        value: parseLatex(contentStr),
                    });
                    i = close + 1;
                    continue;
                }
            } else if (i + 1 < str.length) {
                result.push({
                    type: 'superscript',
                    value: [{ type: 'text', value: str[i + 1] }],
                });
                i += 2;
                continue;
            }
        }

        // 4. Subscript: _
        if (str[i] === '_') {
            if (str[i + 1] === '{') {
                let close = matchBraces(str, i + 1);
                if (close !== -1) {
                    const contentStr = str.substring(i + 2, close);
                    result.push({
                        type: 'subscript',
                        value: parseLatex(contentStr),
                    });
                    i = close + 1;
                    continue;
                }
            } else if (i + 1 < str.length) {
                result.push({
                    type: 'subscript',
                    value: [{ type: 'text', value: str[i + 1] }],
                });
                i += 2;
                continue;
            }
        }

        // 5. Normal text or LaTeX macro
        let char = str[i];
        if (char === '\\') {
            let macro = '\\';
            let j = i + 1;
            while (j < str.length && /[a-zA-Z]/.test(str[j])) {
                macro += str[j];
                j++;
            }
            const symbol = GREEK_MATH_SYMBOLS[macro];
            if (symbol) {
                result.push({ type: 'text', value: symbol });
                i = j;
                continue;
            } else {
                if (str[j] === '{' || str[j] === '}') {
                    result.push({ type: 'text', value: str[j] });
                    i = j + 1;
                    continue;
                }
                result.push({ type: 'text', value: macro });
                i = j;
                continue;
            }
        }

        result.push({ type: 'text', value: char });
        i++;
    }

    // Merge adjacent text nodes
    const merged: MathNode[] = [];
    for (const node of result) {
        if (node.type === 'text' && merged.length > 0 && merged[merged.length - 1].type === 'text') {
            (merged[merged.length - 1] as any).value += node.value;
        } else {
            merged.push(node);
        }
    }

    return merged;
}

// --- HTML Decoder Helper ---
function decodeHtmlEntities(str: string): string {
    return str
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");
}

// --- HTML to TipTap Parser for Fallback ---
function parseHtmlToTipTap(html: string): TipTapNode[] {
    if (!html) return [];

    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

    const blockRegex = /<(p|h[1-6]|blockquote|pre|ul|ol|table|div)[^>]*>([\s\S]*?)<\/\1>/gi;
    const blocks: TipTapNode[] = [];
    let match;

    const parseInlineContent = (text: string): TipTapNode[] => {
        const inlineNodes: TipTapNode[] = [];
        const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>([\s\S]*?)<\/\1>|([^<]+)/gi;
        let inlineMatch;
        while ((inlineMatch = tagRegex.exec(text)) !== null) {
            if (inlineMatch[4]) {
                inlineNodes.push({ type: 'text', text: decodeHtmlEntities(inlineMatch[4]) });
            } else {
                const tag = inlineMatch[1].toLowerCase();
                const attrsRaw = inlineMatch[2];
                const content = inlineMatch[3];

                const children = parseInlineContent(content);
                const marks: { type: string; attrs?: Record<string, any> }[] = [];

                if (tag === 'b' || tag === 'strong') {
                    marks.push({ type: 'bold' });
                } else if (tag === 'i' || tag === 'em') {
                    marks.push({ type: 'italic' });
                } else if (tag === 'u') {
                    marks.push({ type: 'underline' });
                } else if (tag === 'strike' || tag === 's' || tag === 'del') {
                    marks.push({ type: 'strike' });
                } else if (tag === 'code') {
                    marks.push({ type: 'code' });
                } else if (tag === 'a') {
                    const hrefMatch = attrsRaw.match(/href=["']([^"']*)["']/i);
                    marks.push({
                        type: 'link',
                        attrs: { href: hrefMatch ? hrefMatch[1] : '' },
                    });
                }

                for (const child of children) {
                    if (child.type === 'text') {
                        child.marks = [...(child.marks || []), ...marks];
                        inlineNodes.push(child);
                    } else {
                        inlineNodes.push(child);
                    }
                }
            }
        }

        if (inlineNodes.length === 0 && text.trim().length > 0) {
            inlineNodes.push({ type: 'text', text: decodeHtmlEntities(text) });
        }
        return inlineNodes;
    };

    while ((match = blockRegex.exec(html)) !== null) {
        const tag = match[1].toLowerCase();
        const content = match[2];

        if (tag.startsWith('h')) {
            const level = parseInt(tag.charAt(1)) || 1;
            const textVal = content.replace(/<[^>]+>/g, '');
            blocks.push({
                type: 'heading',
                attrs: { level },
                content: [{ type: 'text', text: decodeHtmlEntities(textVal) }],
            });
        } else if (tag === 'p' || tag === 'div') {
            if (content.includes('<img')) {
                const imgRegex = /<img[^>]+src=["']([^"']*)["'][^>]*>/gi;
                let imgMatch;
                while ((imgMatch = imgRegex.exec(content)) !== null) {
                    blocks.push({
                        type: 'image',
                        attrs: { src: imgMatch[1] },
                    });
                }
            } else {
                blocks.push({
                    type: 'paragraph',
                    content: parseInlineContent(content),
                });
            }
        } else if (tag === 'blockquote') {
            blocks.push({
                type: 'blockquote',
                content: parseHtmlToTipTap(content),
            });
        } else if (tag === 'pre') {
            const codeContent = content.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '$1');
            blocks.push({
                type: 'codeBlock',
                content: [{ type: 'text', text: decodeHtmlEntities(codeContent) }],
            });
        } else if (tag === 'ul' || tag === 'ol') {
            const isOrdered = tag === 'ol';
            const items: TipTapNode[] = [];
            const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let liMatch;
            while ((liMatch = liRegex.exec(content)) !== null) {
                items.push({
                    type: 'listItem',
                    content: parseHtmlToTipTap(liMatch[1]),
                });
            }
            blocks.push({
                type: isOrdered ? 'orderedList' : 'bulletList',
                content: items,
            });
        } else if (tag === 'table') {
            const rows: TipTapNode[] = [];
            const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            let trMatch;
            while ((trMatch = trRegex.exec(content)) !== null) {
                const cells: TipTapNode[] = [];
                const tdRegex = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
                let tdMatch;
                while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
                    cells.push({
                        type: tdMatch[1].toLowerCase() === 'th' ? 'tableHeader' : 'tableCell',
                        content: parseHtmlToTipTap(tdMatch[2]),
                    });
                }
                rows.push({
                    type: 'tableRow',
                    content: cells,
                });
            }
            blocks.push({
                type: 'table',
                content: rows,
            });
        }
    }

    if (blocks.length === 0 && html.trim().length > 0) {
        blocks.push({
            type: 'paragraph',
            content: parseInlineContent(html),
        });
    }

    return blocks;
}

// --- Helper to extract YouTube Video ID ---
function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

// ==========================================
// --- Math Renderer Component ---
// ==========================================
type MathRendererProps = {
    latex: string;
    block?: boolean;
    color?: string;
    size?: number;
};

const MathRenderer = ({ latex, block = false, color, size = normalize(15) }: MathRendererProps) => {
    const parsedNodes = useMemo(() => parseLatex(latex), [latex]);
    const { colors, theme } = useTheme();
    const activeColor = color || colors.text;

    const renderNodes = (nodes: MathNode[], currentSize: number = size): React.ReactNode => {
        return nodes.map((node, i) => {
            if (node.type === 'text') {
                const isSingleLetter = /^[a-zA-Z]$/.test(node.value);
                return (
                    <Text
                        key={i}
                        style={{
                            fontSize: currentSize,
                            color: activeColor,
                            fontStyle: isSingleLetter ? 'italic' : 'normal',
                            fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
                        }}
                    >
                        {node.value}
                    </Text>
                );
            }
            if (node.type === 'fraction') {
                return (
                    <View key={i} style={mathStyles.fractionContainer}>
                        <View style={mathStyles.fractionNum}>
                            {renderNodes(node.num, currentSize * 0.82)}
                        </View>
                        <View style={[mathStyles.fractionLine, { backgroundColor: activeColor }]} />
                        <View style={mathStyles.fractionDen}>
                            {renderNodes(node.den, currentSize * 0.82)}
                        </View>
                    </View>
                );
            }
            if (node.type === 'sqrt') {
                return (
                    <View key={i} style={mathStyles.sqrtContainer}>
                        <Text style={{ fontSize: currentSize * 1.15, color: activeColor, marginRight: normalize(-2), fontWeight: '300' }}>√</Text>
                        <View style={[mathStyles.sqrtContent, { borderTopColor: activeColor }]}>
                            {renderNodes(node.value, currentSize * 0.95)}
                        </View>
                    </View>
                );
            }
            if (node.type === 'superscript') {
                return (
                    <View key={i} style={mathStyles.superscript}>
                        {renderNodes(node.value, currentSize * 0.68)}
                    </View>
                );
            }
            if (node.type === 'subscript') {
                return (
                    <View key={i} style={mathStyles.subscript}>
                        {renderNodes(node.value, currentSize * 0.68)}
                    </View>
                );
            }
            return null;
        });
    };

    if (block) {
        return (
            <View
                style={[
                    mathStyles.blockCard,
                    {
                        backgroundColor: theme === 'classic' ? '#FFFBEB' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: theme === 'classic' ? '#FEF3C7' : 'rgba(255, 255, 255, 0.08)',
                    },
                ]}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={mathStyles.blockScroll}>
                    <View style={mathStyles.equationRow}>
                        {renderNodes(parsedNodes, size * 1.1)}
                    </View>
                </ScrollView>
            </View>
        );
    }

    return <View style={mathStyles.inlineContainer}>{renderNodes(parsedNodes)}</View>;
};

// ==========================================
// --- Responsive Image Component ---
// ==========================================
const ResponsiveImage = ({ src, alt }: { src: string; alt?: string }) => {
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const { colors } = useTheme();

    useEffect(() => {
        if (src) {
            Image.getSize(
                src,
                (w, h) => {
                    if (w > 0 && h > 0) {
                        setAspectRatio(w / h);
                    }
                },
                () => {
                    setAspectRatio(16 / 9); // Fallback
                }
            );
        }
    }, [src]);

    const displayStyle = useMemo(() => {
        if (aspectRatio) {
            return {
                width: '100%',
                aspectRatio,
                borderRadius: normalize(8),
            } as const;
        }
        return {
            width: '100%',
            height: normalize(200),
            borderRadius: normalize(8),
        } as const;
    }, [aspectRatio]);

    return (
        <View style={[styles.imageContainer, { borderColor: colors.border }]}>
            {aspectRatio === null ? (
                <View style={styles.imageLoading}>
                    <ActivityIndicator size="small" color={colors.Primary} />
                </View>
            ) : null}
            <Image source={{ uri: src }} style={displayStyle as any} resizeMode="contain" />
            {alt ? (
                <Text style={[styles.imageCaption, { color: colors.textSecondary }]}>{alt}</Text>
            ) : null}
        </View>
    );
};

// ==========================================
// --- Table Components ---
// ==========================================
const TableCellComponent = ({ cell, isHeader, colors }: { cell: TipTapNode; isHeader: boolean; colors: any }) => {
    const { theme } = useTheme();
    return (
        <View
            style={[
                styles.tableCell,
                {
                    borderColor: colors.border,
                    backgroundColor: isHeader
                        ? theme === 'classic'
                            ? '#F1F5F9'
                            : 'rgba(255, 255, 255, 0.08)'
                        : 'transparent',
                    minWidth: normalize(120),
                },
            ]}
        >
            {cell.content ? (
                <View>{cell.content.map((child, i) => renderNode(child, i, colors))}</View>
            ) : null}
        </View>
    );
};

const TableRowComponent = ({ row, colors }: { row: TipTapNode; colors: any }) => {
    return (
        <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
            {row.content?.map((cell, index) => {
                const isHeader = cell.type === 'tableHeader';
                return <TableCellComponent key={index} cell={cell} isHeader={isHeader} colors={colors} />;
            })}
        </View>
    );
};

const TableComponent = ({ node, colors }: { node: TipTapNode; colors: any }) => {
    return (
        <View style={[styles.tableContainer, { borderColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={{ flexDirection: 'column' }}>
                    {node.content?.map((row, index) => (
                        <TableRowComponent key={index} row={row} colors={colors} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

// ==========================================
// --- Code Block Component ---
// ==========================================
const CodeBlockComponent = ({ node, colors }: { node: TipTapNode; colors: any }) => {
    const [copied, setCopied] = useState(false);
    const codeText = useMemo(() => {
        return node.content?.map(c => c.text || '').join('') || '';
    }, [node.content]);

    const handleCopy = () => {
        if (!codeText) return;
        Clipboard.setString(codeText);
        setCopied(true);
        Toast.show({
            type: 'success',
            text1: 'Code copied to clipboard',
            position: 'bottom',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <View style={styles.codeBlockContainer}>
            <View style={styles.codeBlockHeader}>
                <Text style={styles.codeBlockLang}>
                    {node.attrs?.language?.toUpperCase() || 'CODE'}
                </Text>
                <Pressable onPress={handleCopy} style={styles.codeBlockCopyBtn}>
                    <Feather name={copied ? 'check' : 'copy'} size={normalize(14)} color="#94A3B8" />
                    <Text style={styles.codeBlockCopyText}>{copied ? 'Copied' : 'Copy'}</Text>
                </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.codeBlockScroll}>
                <Text style={styles.codeBlockText}>{codeText}</Text>
            </ScrollView>
        </View>
    );
};

// ==========================================
// --- Video Card Component ---
// ==========================================
const VideoComponent = ({ node, colors }: { node: TipTapNode; colors: any }) => {
    const src = node.attrs?.src || '';
    const youtubeId = useMemo(() => getYouTubeId(src), [src]);

    const handlePlay = () => {
        if (src) {
            Linking.openURL(src).catch(() => {
                Toast.show({ type: 'error', text1: 'Could not open video link' });
            });
        }
    };

    return (
        <Pressable
            onPress={handlePlay}
            style={[styles.videoContainer, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
        >
            <View style={styles.videoPreviewWrap}>
                {youtubeId ? (
                    <Image
                        source={{ uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.videoPlaceholderBg} />
                )}
                <View style={styles.videoOverlay}>
                    <View style={styles.videoPlayCircle}>
                        <FontAwesome5 name="play" size={normalize(18)} color="#FFFFFF" style={{ marginLeft: 2 }} />
                    </View>
                </View>
            </View>
            <View style={styles.videoFooter}>
                <Feather name="video" size={normalize(15)} color={colors.Secondary} style={{ marginRight: normalize(6) }} />
                <Text style={[styles.videoUrlText, { color: colors.text }]} numberOfLines={1}>
                    {youtubeId ? 'Watch Video on YouTube' : 'Open Video Link'}
                </Text>
            </View>
        </Pressable>
    );
};

// ==========================================
// --- List Component ---
// ==========================================
const ListComponent = ({ node, isOrdered, colors, depth = 0 }: { node: TipTapNode; isOrdered: boolean; colors: any; depth: number }) => {
    return (
        <View style={[styles.listContainer, { paddingLeft: depth > 0 ? normalize(14) : 0 }]}>
            {node.content?.map((item, index) => {
                return (
                    <View key={index} style={styles.listItemRow}>
                        <Text style={[styles.listPrefix, { color: colors.Secondary }]}>
                            {isOrdered ? `${index + 1}.` : '•'}
                        </Text>
                        <View style={styles.listItemContent}>
                            {item.content ? (
                                <View>{item.content.map((child, i) => renderNode(child, i, colors, depth + 1))}</View>
                            ) : null}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

// ==========================================
// --- Recursive Block Rendering Core ---
// ==========================================
const renderInlineNode = (node: TipTapNode, index: number, colors: any) => {
    const { theme } = useTheme();
    if (node.type === 'text') {
        let textStyle: any = { fontSize: normalize(15), color: colors.text };
        let onPress: any = undefined;

        if (node.marks) {
            let hasUnderline = false;
            let hasStrike = false;

            for (const mark of node.marks) {
                if (mark.type === 'bold') {
                    textStyle.fontWeight = 'bold';
                }
                if (mark.type === 'italic') {
                    textStyle.fontStyle = 'italic';
                }
                if (mark.type === 'underline') {
                    hasUnderline = true;
                }
                if (mark.type === 'strike') {
                    hasStrike = true;
                }
                if (mark.type === 'code') {
                    textStyle.fontFamily = Platform.OS === 'ios' ? 'Courier New' : 'monospace';
                    textStyle.backgroundColor = 'rgba(100, 116, 139, 0.12)';
                    textStyle.color = theme === 'classic' ? '#B91C1C' : '#F87171';
                    textStyle.paddingHorizontal = normalize(4);
                    textStyle.borderRadius = normalize(3);
                }
                if (mark.type === 'link') {
                    textStyle.color = colors.Secondary;
                    hasUnderline = true;
                    const href = mark.attrs?.href;
                    if (href) {
                        onPress = () => {
                            Linking.openURL(href).catch(() => {
                                Toast.show({ type: 'error', text1: 'Could not open URL' });
                            });
                        };
                    }
                }
            }

            if (hasUnderline && hasStrike) {
                textStyle.textDecorationLine = 'underline line-through';
            } else if (hasUnderline) {
                textStyle.textDecorationLine = 'underline';
            } else if (hasStrike) {
                textStyle.textDecorationLine = 'line-through';
            }
        }

        return (
            <Text key={index} style={textStyle} onPress={onPress}>
                {node.text}
            </Text>
        );
    }

    if (node.type === 'hardBreak') {
        return <Text key={index}>{'\n'}</Text>;
    }

    if (node.type === 'math' || node.type === 'mathInline') {
        const latex = node.attrs?.formula || node.attrs?.latex || node.attrs?.text || '';
        return (
            <MathRenderer key={index} latex={latex} block={false} color={colors.text} size={normalize(15)} />
        );
    }

    return null;
};

const renderNode = (node: TipTapNode, index: number, colors: any, depth: number = 0): React.ReactNode => {
    const { theme } = useTheme();
    switch (node.type) {
        case 'heading': {
            const level = node.attrs?.level || 1;
            const headingStyle =
                level === 1 ? styles.h1 :
                level === 2 ? styles.h2 :
                level === 3 ? styles.h3 :
                styles.h4;
            return (
                <Text key={index} style={[headingStyle, { color: colors.text }]}>
                    {node.content?.map((c) => c.text || '').join('') || ''}
                </Text>
            );
        }
        case 'paragraph': {
            return (
                <Text key={index} style={[styles.paragraph, { color: colors.text }]}>
                    {node.content?.map((child, childIdx) => renderInlineNode(child, childIdx, colors)) || ''}
                </Text>
            );
        }
        case 'blockquote': {
            return (
                <View
                    key={index}
                    style={[
                        styles.blockquote,
                        {
                            borderLeftColor: colors.Secondary,
                            backgroundColor: theme === 'classic'
                                ? 'rgba(240, 163, 53, 0.06)'
                                : 'rgba(255, 255, 255, 0.04)',
                        },
                    ]}
                >
                    {node.content?.map((child, childIdx) => (
                        <View key={childIdx}>{renderNode(child, childIdx, colors, depth)}</View>
                    ))}
                </View>
            );
        }
        case 'bulletList':
            return <ListComponent key={index} node={node} isOrdered={false} colors={colors} depth={depth} />;
        case 'orderedList':
            return <ListComponent key={index} node={node} isOrdered={true} colors={colors} depth={depth} />;
        case 'image':
            return <ResponsiveImage key={index} src={node.attrs?.src} alt={node.attrs?.alt || node.attrs?.title} />;
        case 'table':
            return <TableComponent key={index} node={node} colors={colors} />;
        case 'codeBlock':
            return <CodeBlockComponent key={index} node={node} colors={colors} />;
        case 'video':
        case 'youtube':
            return <VideoComponent key={index} node={node} colors={colors} />;
        case 'mathBlock': {
            const latex = node.attrs?.formula || node.attrs?.latex || node.attrs?.text || '';
            return <MathRenderer key={index} latex={latex} block={true} color={colors.text} size={normalize(16)} />;
        }
        case 'math': {
            const latex = node.attrs?.formula || node.attrs?.latex || node.attrs?.text || '';
            return <MathRenderer key={index} latex={latex} block={true} color={colors.text} size={normalize(16)} />;
        }
        default:
            if (node.content) {
                return (
                    <View key={index}>
                        {node.content.map((child, childIdx) => renderNode(child, childIdx, colors, depth))}
                    </View>
                );
            }
            return null;
    }
};

// ==========================================
// --- Main Custom Note Renderer Component ---
// ==========================================
const CustomNoteRenderer = ({ content, htmlFallback }: CustomNoteRendererProps) => {
    const { colors } = useTheme();

    const parsedContent = useMemo(() => {
        if (!content) {
            if (htmlFallback) {
                return parseHtmlToTipTap(htmlFallback);
            }
            return null;
        }

        if (typeof content === 'object') {
            if (content.type === 'doc' && Array.isArray(content.content)) {
                return content.content;
            }
            if (Array.isArray(content)) {
                return content;
            }
            return [content as TipTapNode];
        }

        if (typeof content === 'string') {
            const trimmed = content.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (parsed.type === 'doc' && Array.isArray(parsed.content)) {
                        return parsed.content;
                    }
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                    return [parsed];
                } catch {
                    // Fail silently and fall back
                }
            }

            if (trimmed.includes('<') && trimmed.includes('>')) {
                return parseHtmlToTipTap(trimmed);
            }

            return [
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: trimmed }],
                },
            ];
        }

        return null;
    }, [content, htmlFallback]);

    if (!parsedContent || parsedContent.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Feather name="file-text" size={normalize(24)} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No content available.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {(parsedContent as TipTapNode[]).map((node: TipTapNode, index: number) => renderNode(node, index, colors))}
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    emptyContainer: {
        paddingVertical: verticalScale(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: normalize(14),
        marginTop: verticalScale(8),
    },
    h1: {
        fontSize: normalize(24),
        fontWeight: '800',
        lineHeight: normalize(30),
        marginTop: verticalScale(16),
        marginBottom: verticalScale(12),
    },
    h2: {
        fontSize: normalize(20),
        fontWeight: '800',
        lineHeight: normalize(26),
        marginTop: verticalScale(14),
        marginBottom: verticalScale(10),
    },
    h3: {
        fontSize: normalize(18),
        fontWeight: '700',
        lineHeight: normalize(23),
        marginTop: verticalScale(12),
        marginBottom: verticalScale(8),
    },
    h4: {
        fontSize: normalize(16),
        fontWeight: '700',
        lineHeight: normalize(20),
        marginTop: verticalScale(10),
        marginBottom: verticalScale(6),
    },
    paragraph: {
        fontSize: normalize(15),
        lineHeight: normalize(22),
        marginBottom: verticalScale(12),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    blockquote: {
        borderLeftWidth: 4,
        paddingLeft: normalize(12),
        paddingVertical: verticalScale(6),
        borderRadius: normalize(4),
        marginBottom: verticalScale(14),
        marginTop: verticalScale(6),
    },
    listContainer: {
        marginVertical: verticalScale(6),
    },
    listItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: verticalScale(6),
    },
    listPrefix: {
        fontSize: normalize(15),
        fontWeight: '700',
        width: normalize(20),
        textAlign: 'center',
        marginRight: normalize(4),
    },
    listItemContent: {
        flex: 1,
    },
    imageContainer: {
        marginVertical: verticalScale(14),
        borderRadius: normalize(10),
        borderWidth: 1,
        overflow: 'hidden',
        alignItems: 'center',
        padding: normalize(4),
    },
    imageLoading: {
        height: normalize(160),
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageCaption: {
        fontSize: normalize(12),
        fontStyle: 'italic',
        marginTop: verticalScale(6),
        textAlign: 'center',
        paddingHorizontal: normalize(8),
    },
    tableContainer: {
        marginVertical: verticalScale(14),
        borderRadius: normalize(10),
        borderWidth: 1,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tableCell: {
        padding: normalize(8),
        justifyContent: 'center',
        borderRightWidth: 1,
    },
    codeBlockContainer: {
        marginVertical: verticalScale(14),
        backgroundColor: '#0F172A',
        borderRadius: normalize(10),
        borderWidth: 1,
        borderColor: '#1E293B',
        overflow: 'hidden',
    },
    codeBlockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: normalize(12),
        paddingVertical: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    codeBlockLang: {
        fontSize: normalize(11),
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },
    codeBlockCopyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: normalize(8),
        paddingVertical: verticalScale(4),
        borderRadius: normalize(4),
    },
    codeBlockCopyText: {
        fontSize: normalize(10),
        color: '#94A3B8',
        marginLeft: normalize(4),
        fontWeight: '600',
    },
    codeBlockScroll: {
        maxHeight: normalize(200),
    },
    codeBlockText: {
        padding: normalize(14),
        fontSize: normalize(13),
        lineHeight: normalize(18),
        color: '#F8FAFC',
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    videoContainer: {
        marginVertical: verticalScale(14),
        borderRadius: normalize(10),
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    videoPreviewWrap: {
        height: normalize(160),
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
        opacity: 0.85,
    },
    videoPlaceholderBg: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1E293B',
    },
    videoOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlayCircle: {
        width: normalize(54),
        height: normalize(54),
        borderRadius: normalize(27),
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    videoFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(10),
    },
    videoUrlText: {
        fontSize: normalize(13),
        fontWeight: '600',
        flex: 1,
    },
});

// --- Math-specific Styles ---
const mathStyles = StyleSheet.create({
    inlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        display: 'flex',
    },
    equationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    blockCard: {
        width: '100%',
        marginVertical: verticalScale(10),
        padding: normalize(14),
        borderRadius: normalize(10),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blockScroll: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fractionContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginHorizontal: normalize(2),
        paddingHorizontal: normalize(1),
    },
    fractionNum: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 1,
    },
    fractionLine: {
        height: 1,
        width: '100%',
    },
    fractionDen: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 1,
    },
    sqrtContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: normalize(2),
    },
    sqrtContent: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 1,
        paddingHorizontal: normalize(2),
    },
    superscript: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: normalize(-5),
        paddingLeft: 0.5,
    },
    subscript: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginBottom: normalize(-5),
        paddingLeft: 0.5,
    },
});

export default memo(CustomNoteRenderer);
