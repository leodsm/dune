<?php
/**
 * Plugin Name: Arrakis Core
 * Description: Núcleo editorial e MCP do Arquivo Arrakis.
 * Version: 0.1.0
 * Requires at least: 6.9
 * Requires PHP: 8.1
 * Requires Plugins: mcp-adapter
 * Author: Arquivo Arrakis
 * Text Domain: arrakis-core
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Arrakis_Core {
	const VERSION = '0.1.0';

	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register_post_types' ) );
		add_action( 'wp_abilities_api_categories_init', array( __CLASS__, 'register_ability_category' ) );
		add_action( 'wp_abilities_api_init', array( __CLASS__, 'register_abilities' ) );
	}

	public static function register_post_types(): void {
		register_post_type(
			'arrakis_card',
			array(
				'labels' => array(
					'name'          => 'Cards',
					'singular_name' => 'Card',
					'add_new_item'  => 'Adicionar card',
					'edit_item'     => 'Editar card',
				),
				'public'       => true,
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-format-image',
				'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
				'rewrite'      => array( 'slug' => 'cards' ),
			)
		);

		register_post_type(
			'arrakis_video',
			array(
				'labels' => array(
					'name'          => 'Vídeos curtos',
					'singular_name' => 'Vídeo curto',
					'add_new_item'  => 'Adicionar brief de vídeo',
					'edit_item'     => 'Editar brief de vídeo',
				),
				'public'       => true,
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-video-alt3',
				'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
				'rewrite'      => array( 'slug' => 'videos' ),
			)
		);
	}

	public static function register_ability_category(): void {
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		wp_register_ability_category(
			'arrakis-editorial',
			array(
				'label'       => 'Arquivo Arrakis — Editorial',
				'description' => 'Ferramentas editoriais seguras para pesquisa, cards, matérias e vídeos.',
			)
		);
	}

	public static function register_abilities(): void {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		wp_register_ability(
			'arrakis/get-project-status',
			array(
				'label'               => 'Verificar estado do Arquivo Arrakis',
				'description'         => 'Retorna informações básicas do WordPress e do núcleo Arrakis. Use para verificar se o MCP está conectado ao projeto correto.',
				'category'            => 'arrakis-editorial',
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'project'           => array( 'type' => 'string' ),
						'arrakis_version'   => array( 'type' => 'string' ),
						'wordpress_version' => array( 'type' => 'string' ),
						'site_url'          => array( 'type' => 'string' ),
					),
					'required' => array( 'project', 'arrakis_version', 'wordpress_version', 'site_url' ),
				),
				'execute_callback'    => array( __CLASS__, 'ability_get_project_status' ),
				'permission_callback' => array( __CLASS__, 'can_edit' ),
				'meta'                => array(
					'public'      => true,
					'annotations' => array( 'readonly' => true, 'destructive' => false ),
				),
			)
		);

		wp_register_ability(
			'arrakis/list-editorial-content',
			array(
				'label'               => 'Listar conteúdo editorial',
				'description'         => 'Lista rascunhos e conteúdos recentes de matérias, cards ou vídeos do Arquivo Arrakis.',
				'category'            => 'arrakis-editorial',
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'type' => array(
							'type' => 'string',
							'enum' => array( 'article', 'card', 'video' ),
						),
						'limit' => array( 'type' => 'integer', 'minimum' => 1, 'maximum' => 50 ),
					),
					'required' => array( 'type' ),
				),
				'output_schema'       => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'id'     => array( 'type' => 'integer' ),
							'title'  => array( 'type' => 'string' ),
							'status' => array( 'type' => 'string' ),
							'url'    => array( 'type' => 'string' ),
						),
						'required' => array( 'id', 'title', 'status', 'url' ),
					),
				),
				'execute_callback'    => array( __CLASS__, 'ability_list_content' ),
				'permission_callback' => array( __CLASS__, 'can_edit' ),
				'meta'                => array(
					'public'      => true,
					'annotations' => array( 'readonly' => true, 'destructive' => false ),
				),
			)
		);

		self::register_create_draft_ability(
			'arrakis/create-article-draft',
			'Criar rascunho de matéria',
			'Cria uma matéria como rascunho. Use para análises, guias, explicações e comparações editoriais.',
			'article'
		);

		self::register_create_draft_ability(
			'arrakis/create-card-draft',
			'Criar rascunho de card 1080x1350',
			'Cria um card editorial 4:5 como rascunho, incluindo texto, prompt visual, legenda e metadados para posterior geração da arte.',
			'card'
		);

		self::register_create_draft_ability(
			'arrakis/create-video-brief-draft',
			'Criar brief de vídeo curto',
			'Cria um brief de vídeo curto como rascunho, com roteiro, narração, cenas e prompts visuais para produção assistida por IA.',
			'video'
		);
	}

	private static function register_create_draft_ability( string $name, string $label, string $description, string $kind ): void {
		$properties = array(
			'title'   => array( 'type' => 'string', 'minLength' => 3 ),
			'content' => array( 'type' => 'string', 'minLength' => 1 ),
			'excerpt' => array( 'type' => 'string' ),
		);
		$required = array( 'title', 'content' );

		if ( 'card' === $kind ) {
			$properties['hook']         = array( 'type' => 'string' );
			$properties['cta']          = array( 'type' => 'string' );
			$properties['image_prompt'] = array( 'type' => 'string' );
			$properties['alt_text']     = array( 'type' => 'string' );
			$properties['caption']      = array( 'type' => 'string' );
		}

		if ( 'video' === $kind ) {
			$properties['duration_seconds'] = array( 'type' => 'integer', 'minimum' => 5, 'maximum' => 90 );
			$properties['format']           = array( 'type' => 'string', 'enum' => array( '9:16', '4:5', '16:9' ) );
			$properties['voiceover']        = array( 'type' => 'string' );
			$properties['visual_prompts']   = array( 'type' => 'string' );
		}

		wp_register_ability(
			$name,
			array(
				'label'               => $label,
				'description'         => $description,
				'category'            => 'arrakis-editorial',
				'input_schema'        => array(
					'type'                 => 'object',
					'properties'           => $properties,
					'required'             => $required,
					'additionalProperties' => false,
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'id'      => array( 'type' => 'integer' ),
						'status'  => array( 'type' => 'string', 'enum' => array( 'draft' ) ),
						'edit_url'=> array( 'type' => 'string' ),
						'type'    => array( 'type' => 'string' ),
					),
					'required' => array( 'id', 'status', 'edit_url', 'type' ),
				),
				'execute_callback'    => function ( array $input ) use ( $kind ) {
					return self::ability_create_draft( $kind, $input );
				},
				'permission_callback' => array( __CLASS__, 'can_edit' ),
				'meta'                => array(
					'public'      => true,
					'annotations' => array( 'readonly' => false, 'destructive' => false ),
				),
			)
		);
	}

	public static function can_edit(): bool {
		return current_user_can( 'edit_posts' );
	}

	public static function ability_get_project_status(): array {
		global $wp_version;

		return array(
			'project'           => 'Arquivo Arrakis',
			'arrakis_version'   => self::VERSION,
			'wordpress_version' => (string) $wp_version,
			'site_url'          => site_url( '/' ),
		);
	}

	public static function ability_list_content( array $input ): array {
		$type_map = array(
			'article' => 'post',
			'card'    => 'arrakis_card',
			'video'   => 'arrakis_video',
		);
		$post_type = $type_map[ $input['type'] ] ?? 'post';
		$limit     = isset( $input['limit'] ) ? min( 50, max( 1, (int) $input['limit'] ) ) : 10;

		$posts = get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => array( 'draft', 'pending', 'publish', 'future', 'private' ),
				'posts_per_page' => $limit,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		return array_map(
			static function ( WP_Post $post ): array {
				return array(
					'id'     => (int) $post->ID,
					'title'  => get_the_title( $post ),
					'status' => $post->post_status,
					'url'    => get_edit_post_link( $post->ID, 'raw' ) ?: '',
				);
			},
			$posts
		);
	}

	public static function ability_create_draft( string $kind, array $input ) {
		$type_map = array(
			'article' => 'post',
			'card'    => 'arrakis_card',
			'video'   => 'arrakis_video',
		);

		$post_type = $type_map[ $kind ] ?? 'post';
		$post_id   = wp_insert_post(
			array(
				'post_type'    => $post_type,
				'post_status'  => 'draft',
				'post_title'   => sanitize_text_field( $input['title'] ),
				'post_content' => wp_kses_post( $input['content'] ),
				'post_excerpt' => isset( $input['excerpt'] ) ? sanitize_textarea_field( $input['excerpt'] ) : '',
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$allowed_meta = array(
			'hook', 'cta', 'image_prompt', 'alt_text', 'caption',
			'duration_seconds', 'format', 'voiceover', 'visual_prompts',
		);

		foreach ( $allowed_meta as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$value = is_int( $input[ $key ] ) ? $input[ $key ] : sanitize_textarea_field( (string) $input[ $key ] );
				update_post_meta( $post_id, '_arrakis_' . $key, $value );
			}
		}

		if ( 'card' === $kind ) {
			update_post_meta( $post_id, '_arrakis_canvas_width', 1080 );
			update_post_meta( $post_id, '_arrakis_canvas_height', 1350 );
			update_post_meta( $post_id, '_arrakis_aspect_ratio', '4:5' );
		}

		return array(
			'id'       => (int) $post_id,
			'status'   => 'draft',
			'edit_url' => get_edit_post_link( $post_id, 'raw' ) ?: '',
			'type'     => $kind,
		);
	}
}

Arrakis_Core::init();
